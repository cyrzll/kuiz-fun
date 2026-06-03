import React, { useState, useEffect } from 'react';
import AuthCard from './AuthCard';
import NeoModal from './NeoModal';

export default function TeacherApp() {
  // Modal state (replaces browser alert)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));

  // Redirect to dashboard if session exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('quiz_mentor_profile');
      if (savedUser) {
        window.location.href = '/mentor';
      }
    }
  }, []);

  const handleTeacherLogin = (profile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quiz_mentor_profile', JSON.stringify(profile));
      localStorage.setItem('quiz_mentor_view', 'dashboard');
      window.location.href = '/mentor';
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl bg-neo-pink p-1.5 neo-border shadow-sm text-white">🔑</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1">
                PORTAL <span className="bg-neo-pink text-white px-1.5 neo-border shadow-sm border-black">MENTOR / GURU</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Dashboard Manajemen Kelas & Pembuat Kuis
              </p>
            </div>
          </div>
          <a
            href="/"
            className="neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100"
          >
            <span>BERANDA SISWA</span>
            <span>🏠</span>
          </a>
        </header>

        {/* View Router */}
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white neo-box p-4 border-dashed border-gray-400">
            <span className="text-[10px] font-black uppercase tracking-widest bg-neo-pink text-white px-2 py-0.5 neo-border shadow-sm">Autentikasi Guru</span>
            <p className="text-xs font-semibold text-gray-700 mt-2">
              Daftar atau login di bawah ini untuk mengakses kumpulan soal Pancasila, kontrol room kelas, dan analitik laporan kuis secara real-time.
            </p>
          </div>
          <AuthCard onAuthSuccess={handleTeacherLogin} />
        </div>

        {/* NeoModal (replaces browser alert) */}
        <NeoModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          icon={modal.icon}
          onConfirm={modal.onConfirm}
          confirmText={modal.confirmText || 'MENGERTI'}
        />

      </div>
    </main>
  );
}
