import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_DqHlnE6_.mjs';
import { $ as $$Layout } from './Layout_stwwPH4h.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { N as NeoModal } from './NeoModal_B1LlZDnY.mjs';

function AuthCard({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validate = () => {
    let tempErrors = {};
    if (activeTab === "register") {
      if (!formData.name.trim()) tempErrors.name = "Nama lengkap wajib diisi!";
      if (!formData.schoolName.trim()) tempErrors.schoolName = "Nama Sekolah/Instansi wajib diisi!";
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Konfirmasi password tidak cocok!";
      }
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms = "Anda harus menyetujui syarat & ketentuan!";
      }
    }
    if (!formData.email.trim()) {
      tempErrors.email = "Email wajib diisi!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Format email tidak valid!";
    }
    if (!formData.password) {
      tempErrors.password = "Password wajib diisi!";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password minimal terdiri dari 6 karakter!";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess({
        email: formData.email,
        name: formData.name || formData.email.split("@")[0],
        schoolName: formData.schoolName || "SD Pancasila Merdeka"
      });
    }, 1e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white rounded-none relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute -top-3 -right-12 bg-neo-yellow text-black font-extrabold py-1 px-12 rotate-12 neo-border text-xs uppercase tracking-wider shadow-sm", children: "Mentor / Guru" }),
    /* @__PURE__ */ jsxs("div", { className: "flex neo-border-b bg-gray-50", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setActiveTab("login");
            setErrors({});
          },
          className: `flex-1 py-3 sm:py-4 font-black uppercase text-sm tracking-wider border-r-[3px] border-black transition-all ${activeTab === "login" ? "bg-neo-yellow text-black" : "bg-white hover:bg-gray-100"}`,
          children: "🔑 Masuk"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setActiveTab("register");
            setErrors({});
          },
          className: `flex-1 py-3 sm:py-4 font-black uppercase text-sm tracking-wider transition-all ${activeTab === "register" ? "bg-neo-yellow text-black" : "bg-white hover:bg-gray-100"}`,
          children: "📝 Daftar"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black uppercase tracking-tight", children: activeTab === "login" ? "Selamat Datang Kembali!" : "Gabung Sebagai Mentor" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mt-1 font-medium", children: activeTab === "login" ? "Kelola ruang kelas, buat kuis, dan pantau hasil belajar siswa Anda secara real-time." : "Dapatkan akses penuh ke generator kuis Pancasila, pembuat room, dan analitik siswa." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        activeTab === "register" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Nama Lengkap" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                placeholder: "Budi Setiawan, S.Pd.",
                className: "w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base",
                disabled: loading
              }
            ),
            errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Sekolah / Instansi" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "schoolName",
                value: formData.schoolName,
                onChange: handleInputChange,
                placeholder: "SD Negeri 1 Merdeka",
                className: "w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base",
                disabled: loading
              }
            ),
            errors.schoolName && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.schoolName })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Alamat Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              name: "email",
              value: formData.email,
              onChange: handleInputChange,
              placeholder: "budi@sekolah.sch.id",
              className: "w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base",
              disabled: loading
            }
          ),
          errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              name: "password",
              value: formData.password,
              onChange: handleInputChange,
              placeholder: "••••••••",
              className: "w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base",
              disabled: loading
            }
          ),
          errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.password })
        ] }),
        activeTab === "register" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Konfirmasi Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                name: "confirmPassword",
                value: formData.confirmPassword,
                onChange: handleInputChange,
                placeholder: "••••••••",
                className: "w-full p-2.5 sm:p-3 rounded-none neo-input bg-white text-base",
                disabled: loading
              }
            ),
            errors.confirmPassword && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.confirmPassword })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 pt-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                name: "agreeToTerms",
                id: "agreeToTerms",
                checked: formData.agreeToTerms,
                onChange: handleInputChange,
                className: "w-5 h-5 accent-neo-yellow neo-border cursor-pointer shrink-0",
                disabled: loading
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "agreeToTerms", className: "text-xs font-bold text-gray-700 select-none cursor-pointer leading-tight", children: "Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi Pancasila Fun Quiz." })
          ] }),
          errors.agreeToTerms && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 font-bold", children: errors.agreeToTerms })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full mt-4 py-3 sm:py-4 neo-btn bg-neo-yellow text-black hover:bg-neo-yellow/95 transition-all text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5 text-black", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              /* @__PURE__ */ jsx("span", { children: "MEMPROSES..." })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: activeTab === "login" ? "MASUK KE DASHBOARD" : "BUAT AKUN BARU" }),
              /* @__PURE__ */ jsx("span", { children: "🔥" })
            ] })
          }
        )
      ] })
    ] })
  ] });
}

function TeacherApp() {
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info", icon: "⚠️", onConfirm: null });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("quiz_mentor_profile");
      if (savedUser) {
        window.location.href = "/mentor";
      }
    }
  }, []);
  const handleTeacherLogin = (profile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quiz_mentor_profile", JSON.stringify(profile));
      localStorage.setItem("quiz_mentor_view", "dashboard");
      window.location.href = "/mentor";
    }
  };
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
    /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white neo-box p-4 border-dashed border-gray-400", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest bg-neo-pink text-white px-2 py-0.5 neo-border shadow-sm", children: "Autentikasi Guru" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-700 mt-2", children: "Daftar atau login di bawah ini untuk mengakses kumpulan soal Pancasila, kontrol room kelas, dan analitik laporan kuis secara real-time." })
      ] }),
      /* @__PURE__ */ jsx(AuthCard, { onAuthSuccess: handleTeacherLogin })
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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TeacherApp", TeacherApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/components/TeacherApp.jsx", "client:component-export": "default" })} ` })}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/auth/index.astro", void 0);

const $$file = "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/auth/index.astro";
const $$url = "/auth";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
