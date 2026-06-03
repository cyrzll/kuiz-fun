import React, { useState, useEffect, useRef } from 'react';
import QuizLobby from './QuizLobby';
import NeoModal from './NeoModal';

const getBackendUrl = (path, isWs = false) => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = isWs ? 'ws' : 'http';
  return `${protocol}://${host}:3000${path}`;
};

export default function MentorRoomApp({ slug }) {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [currentView, setCurrentView] = useState('lobby'); // 'lobby', 'monitor'
  const [monitorStudents, setMonitorStudents] = useState([]);

  const wsRef = useRef(null);

  // Modal state (replaces browser alert)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));

  // Load profile and verify room on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('quiz_mentor_profile');
      if (!savedUser) {
        window.location.href = '/auth';
        return;
      }
      setUser(JSON.parse(savedUser));

      // Restore saved view or active quiz if it matches the current slug
      const savedRoomCode = localStorage.getItem('quiz_mentor_room_code') || '';
      if (savedRoomCode === slug) {
        const savedView = localStorage.getItem('quiz_mentor_view') || 'lobby';
        setCurrentView(savedView);
        const savedActiveQuiz = localStorage.getItem('quiz_mentor_active_quiz');
        if (savedActiveQuiz) {
          try {
            setActiveQuiz(JSON.parse(savedActiveQuiz));
          } catch (e) {
            console.error(e);
          }
        }
      }

      // Fetch Room Info to verify existence
      const verifyRoom = async () => {
        try {
          const roomRes = await fetch(getBackendUrl(`/api/rooms/${slug}`));
          if (roomRes.status === 404) {
            showModal({
              title: 'Room Tidak Ditemukan',
              message: `Room kuis dengan kode ${slug} tidak ditemukan dalam database.`,
              type: 'error',
              icon: '❌',
              onConfirm: () => {
                window.location.href = '/mentor';
              },
              confirmText: 'KEMBALI KE DASHBOARD'
            });
            setRoomLoading(false);
            return;
          }
          const roomData = await roomRes.json();
          setRoom(roomData);

          // If the room status is already 'active', we should show the monitor view
          if (roomData.status === 'active') {
            setCurrentView('monitor');
            localStorage.setItem('quiz_mentor_view', 'monitor');
          }

          // If activeQuiz was not restored, reconstruct basic info from roomData
          if (!activeQuiz) {
            setActiveQuiz({
              title: roomData.quizTitle,
              id: roomData.modulId === 'modul_pancasila_dasar' ? '1' : roomData.modulId === 'modul_gotong_royong' ? '2' : roomData.modulId === 'modul_sejarah_pancasila' ? '3' : '4'
            });
          }
        } catch (err) {
          console.error(err);
          showModal({
            title: 'Koneksi Gagal',
            message: 'Gagal memverifikasi status room dari server backend.',
            type: 'error',
            icon: '📡'
          });
        } finally {
          setRoomLoading(false);
        }
      };

      verifyRoom();
    }
  }, [slug]);

  // Manage live WebSocket connection for the room
  useEffect(() => {
    if (user && slug && !roomLoading && room) {
      const wsUrl = getBackendUrl(`/ws?role=teacher&roomCode=${slug}`, true);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Teacher WS connected for room:', slug);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'MONITOR_UPDATE') {
            setMonitorStudents(msg.data);
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Error:', err);
      };

      ws.onclose = () => {
        console.log('Teacher WS closed');
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
      wsRef.current.send(JSON.stringify({ type: 'START_GAME' }));
    }
    setCurrentView('monitor');
    if (typeof window !== 'undefined') {
      localStorage.setItem('quiz_mentor_view', 'monitor');
    }
  };

  const handleCancelLobby = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CANCEL_GAME' }));
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_mentor_room_code');
      localStorage.removeItem('quiz_mentor_active_quiz');
      localStorage.removeItem('quiz_mentor_view');
      window.location.href = '/mentor';
    }
  };

  if (roomLoading || !user) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full neo-box bg-white p-8 text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-neo-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-bold text-gray-700">Menghubungkan ke room kuis...</p>
        </div>
        {/* NeoModal in loading state */}
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
          <button
            onClick={() => {
              window.location.href = '/mentor';
            }}
            className="neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100"
          >
            <span>KEMBALI KE DASHBOARD</span>
            <span>📂</span>
          </button>
        </header>

        {currentView === 'lobby' && (
          <QuizLobby
            role="teacher"
            roomCode={slug}
            quizTitle={activeQuiz?.title || room?.quizTitle || 'Kuis Kustom'}
            onStartGame={handleStartGame}
            onCancel={handleCancelLobby}
            students={monitorStudents.map(s => s.name)}
          />
        )}

        {currentView === 'monitor' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Monitor Header */}
            <div className="neo-box bg-neo-yellow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="bg-neo-pink text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
                  Live Monitoring 🔴
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                  Kuis Sedang Berlangsung
                </h1>
                <p className="text-black font-semibold text-sm mt-1">
                  Melihat kemajuan siswa secara real-time pada kuis: <span className="underline decoration-2">{activeQuiz?.title || room?.quizTitle}</span> (Room: {slug})
                </p>
              </div>

              <button
                onClick={handleCancelLobby}
                className="neo-btn bg-neo-pink text-white px-6 py-3 text-sm shrink-0 w-full md:w-auto"
              >
                SELESAIKAN SESI KELAS 🛑
              </button>
            </div>

            {/* Students Progress Table */}
            <div className="neo-box bg-white p-6 space-y-4">
              <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-black">
                Progress Pengerjaan Siswa
              </h2>

              <div className="space-y-6">
                {monitorStudents.map((s) => {
                  const percent = s.step === 'quiz'
                    ? Math.round((s.currentQuestionIdx / 7) * 100) // 7 questions in total
                    : s.progressPercent || 0;
                  const isDone = s.isFinished;
                  
                  let statusText = 'Memilih Modul';
                  if (isDone) {
                    statusText = 'SELESAI 🎉';
                  } else if (s.step === 'quiz') {
                    statusText = `Kuis: Soal ${s.currentQuestionIdx + 1}/7`;
                  } else if (s.step === 'materials') {
                    statusText = `Membaca Slide (${s.progressPercent}%)`;
                  }

                  return (
                    <div key={s.name} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-extrabold uppercase">
                        <span className="flex items-center gap-2">
                          <span>👤</span> {s.name}
                        </span>
                        <span className="text-xs">
                          {isDone ? (
                            <span className="bg-neo-green text-black px-2 py-0.5 text-[10px] neo-border font-black">
                              {statusText}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-black px-2 py-0.5 text-[10px] neo-border font-black">
                              {statusText}
                            </span>
                          )}
                          <span className="ml-3 text-neo-blue">{s.score} pts</span>
                        </span>
                      </div>
                      
                      {/* Neobrutalist Progress Bar */}
                      <div className="h-6 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative">
                        <div
                          className="h-full bg-neo-yellow border-r-[3px] border-black transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black select-none">
                          {Math.round(percent)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulator note */}
            <div className="text-center p-4 bg-neo-blue/10 neo-border text-xs font-bold text-blue-900">
              💡 Ini adalah sesi live di layar kelas Anda. Minta siswa membuka situs ini di HP/Laptop mereka, lalu masukkan kode room kuis: <strong className="underline text-black">{slug}</strong>.
            </div>
          </div>
        )}

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
