import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useEffect } from 'react';

function NeoModal({
  isOpen,
  onClose,
  title = "Pemberitahuan",
  message = "",
  icon = "⚠️",
  type = "info",
  confirmText = "MENGERTI",
  onConfirm,
  cancelText = "BATAL"
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const colorMap = {
    info: {
      bg: "bg-[#EBF4F6]",
      accent: "bg-neo-blue",
      btnBg: "bg-neo-blue text-white",
      border: "border-neo-blue"
    },
    error: {
      bg: "bg-[#FFE6E6]",
      accent: "bg-neo-pink",
      btnBg: "bg-neo-pink text-white",
      border: "border-neo-pink"
    },
    warning: {
      bg: "bg-[#FFF8E1]",
      accent: "bg-neo-yellow",
      btnBg: "bg-neo-yellow text-black",
      border: "border-neo-yellow"
    },
    success: {
      bg: "bg-[#E8F5E9]",
      accent: "bg-neo-green",
      btnBg: "bg-neo-green text-black",
      border: "border-neo-green"
    }
  };
  const colors = colorMap[type] || colorMap.info;
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
      onClick: handleBackdropClick,
      style: { animation: "neoModalFadeIn 0.15s ease-out" },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: modalRef,
            className: `relative neo-box ${colors.bg} w-full max-w-md p-0 overflow-hidden`,
            style: { animation: "neoModalSlideUp 0.2s ease-out" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: `${colors.accent} text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2`, children: [
                /* @__PURE__ */ jsx("span", { children: icon }),
                /* @__PURE__ */ jsx("span", { children: type === "error" ? "KESALAHAN" : type === "warning" ? "PERINGATAN" : type === "success" ? "BERHASIL" : "INFORMASI" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-black uppercase tracking-tight text-black leading-tight", children: title }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-700 leading-relaxed", children: message }),
                /* @__PURE__ */ jsxs("div", { className: `flex gap-3 pt-2 ${onConfirm ? "flex-row" : "flex-col"}`, children: [
                  onConfirm && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: onClose,
                      className: "flex-1 py-3 neo-btn bg-white text-black text-xs font-black",
                      children: cancelText
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (onConfirm) {
                          onConfirm();
                        } else {
                          onClose();
                        }
                      },
                      className: `flex-1 py-3 neo-btn ${colors.btnBg} text-xs font-black`,
                      children: confirmText
                    }
                  )
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("style", { children: `
        @keyframes neoModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes neoModalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      ` })
      ]
    }
  );
}

export { NeoModal as N };
