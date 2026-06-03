import React, { useEffect, useRef } from 'react';

/**
 * NeoModal - A neobrutalism-styled modal to replace browser alert() calls.
 * 
 * Props:
 * - isOpen: boolean - Whether the modal is visible
 * - onClose: function - Callback when modal is dismissed
 * - title: string - Modal title text
 * - message: string - Modal body message
 * - icon: string (emoji) - Icon displayed at top (default: '⚠️')
 * - type: 'info' | 'error' | 'warning' | 'success' - Controls color scheme
 * - confirmText: string - Text for the confirm/close button
 * - onConfirm: function - Optional callback for confirm action (if provided, shows both Cancel + Confirm buttons)
 * - cancelText: string - Text for cancel button (only shown if onConfirm is provided)
 */
export default function NeoModal({
  isOpen,
  onClose,
  title = 'Pemberitahuan',
  message = '',
  icon = '⚠️',
  type = 'info',
  confirmText = 'MENGERTI',
  onConfirm,
  cancelText = 'BATAL'
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colorMap = {
    info: {
      bg: 'bg-[#EBF4F6]',
      accent: 'bg-neo-blue',
      btnBg: 'bg-neo-blue text-white',
      border: 'border-neo-blue'
    },
    error: {
      bg: 'bg-[#FFE6E6]',
      accent: 'bg-neo-pink',
      btnBg: 'bg-neo-pink text-white',
      border: 'border-neo-pink'
    },
    warning: {
      bg: 'bg-[#FFF8E1]',
      accent: 'bg-neo-yellow',
      btnBg: 'bg-neo-yellow text-black',
      border: 'border-neo-yellow'
    },
    success: {
      bg: 'bg-[#E8F5E9]',
      accent: 'bg-neo-green',
      btnBg: 'bg-neo-green text-black',
      border: 'border-neo-green'
    }
  };

  const colors = colorMap[type] || colorMap.info;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{ animation: 'neoModalFadeIn 0.15s ease-out' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={`relative neo-box ${colors.bg} w-full max-w-md p-0 overflow-hidden`}
        style={{ animation: 'neoModalSlideUp 0.2s ease-out' }}
      >
        {/* Decorative tape strip */}
        <div className={`${colors.accent} text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2`}>
          <span>{icon}</span>
          <span>{type === 'error' ? 'KESALAHAN' : type === 'warning' ? 'PERINGATAN' : type === 'success' ? 'BERHASIL' : 'INFORMASI'}</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black leading-tight">
            {title}
          </h3>

          <p className="text-sm font-semibold text-gray-700 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className={`flex gap-3 pt-2 ${onConfirm ? 'flex-row' : 'flex-col'}`}>
            {onConfirm && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 neo-btn bg-white text-black text-xs font-black"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
              className={`flex-1 py-3 neo-btn ${colors.btnBg} text-xs font-black`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes neoModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes neoModalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
