import React, { useState, useEffect } from 'react';
import TeacherDashboard from './TeacherDashboard';
import NeoModal from './NeoModal';

const getBackendUrl = (path, isWs = false) => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = isWs ? 'ws' : 'http';
  return `${protocol}://${host}:3000${path}`;
};

export default function MentorDashboardApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state (replaces browser alert)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));

  // Load profile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('quiz_mentor_profile');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error(e);
          localStorage.removeItem('quiz_mentor_profile');
          window.location.href = '/auth';
        }
      } else {
        window.location.href = '/auth';
      }
      setLoading(false);
    }
  }, []);

  const handleTeacherLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_mentor_profile');
      localStorage.removeItem('quiz_mentor_view');
      localStorage.removeItem('quiz_mentor_room_code');
      localStorage.removeItem('quiz_mentor_active_quiz');
      window.location.href = '/auth';
    }
  };

  const handleLaunchLobby = async (quiz) => {
    let dbModulId = 'modul_pancasila_dasar';
    if (quiz.id === '2') dbModulId = 'modul_gotong_royong';
    else if (quiz.id === '3') dbModulId = 'modul_sejarah_pancasila';
    else if (quiz.id === '4') dbModulId = 'modul_norma_hak_kewajiban';

    try {
      const res = await fetch(getBackendUrl('/api/rooms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
          title: 'Gagal Membuat Room',
          message: 'Error saat membuat room: ' + data.error,
          type: 'error',
          icon: '❌'
        });
        return;
      }

      // Save room state for active room session
      localStorage.setItem('quiz_mentor_room_code', data.roomCode);
      localStorage.setItem('quiz_mentor_active_quiz', JSON.stringify(quiz));
      localStorage.setItem('quiz_mentor_view', 'lobby');

      // Redirect to dynamic room route
      window.location.href = `/mentor/quiz/${data.roomCode}`;
    } catch (err) {
      console.error(err);
      showModal({
        title: 'Koneksi Gagal',
        message: 'Gagal terhubung ke server backend untuk membuat room. Pastikan server berjalan dan coba lagi.',
        type: 'error',
        icon: '📡'
      });
    }
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full neo-box bg-white p-8 text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-neo-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-bold text-gray-700">Memeriksa autentikasi...</p>
        </div>
      </main>
    );
  }

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

        <TeacherDashboard
          user={user}
          onLogout={handleTeacherLogout}
          onLaunchLobby={handleLaunchLobby}
        />

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
