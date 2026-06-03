import React, { useState, useEffect, useRef } from 'react';
import QuizLobby from './QuizLobby';
import NeoModal from './NeoModal';

const COLORS = [
  'bg-neo-yellow',
  'bg-neo-pink text-white',
  'bg-neo-blue text-white',
  'bg-neo-green text-white',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-purple-400 text-white',
  'bg-orange-400'
];

const getBackendUrl = (path, isWs = false) => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = isWs ? 'ws' : 'http';
  return `${protocol}://${host}:3000${path}`;
};

export default function GameFlowApp({ slug }) {
  // Get room code from prop or query param
  const getRoomCode = () => {
    if (slug) return slug;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('code') || '';
    }
    return '';
  };
  const roomCode = getRoomCode();

  // 1. Core State
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [modulesData, setModulesData] = useState({});

  const [studentName, setStudentName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [step, setStep] = useState('intro'); // 'intro', 'lobby', 'select-module', 'materials', 'quiz', 'finished'
  const [selectedModulId, setSelectedModulId] = useState('');
  const [materialIdx, setMaterialIdx] = useState(0);
  const [readSlidesGlobal, setReadSlidesGlobal] = useState([]); // ["modulId_slideIdx"]

  // Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scoreboardStudents, setScoreboardStudents] = useState([]);

  const timerRef = useRef(null);
  const wsRef = useRef(null);

  // Modal state (replaces browser alert)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null, onClose: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => {
    if (modal.onClose) {
      modal.onClose();
    }
    setModal(prev => ({ ...prev, isOpen: false, onConfirm: null, onClose: null }));
  };

  // Derived variables
  const allModules = Object.values(modulesData);
  const totalMaterialsCount = allModules.reduce((acc, m) => acc + (m.materials?.length || 0), 0);
  const globalProgressPercent = totalMaterialsCount > 0 ? (readSlidesGlobal.length / totalMaterialsCount) * 100 : 0;
  
  const modul = modulesData[selectedModulId];
  const materials = modul?.materials || [];

  const activeQuestions = allModules.reduce((acc, m) => [...acc, ...(m.questions || [])], []);
  const questions = activeQuestions;

  // 2. REST Data Initialization & Re-auth
  useEffect(() => {
    if (!roomCode) {
      setRoomLoading(false);
      return;
    }

    const loadInitialData = async () => {
      try {
        // Fetch Room Info
        const roomRes = await fetch(getBackendUrl(`/api/rooms/${roomCode}`));
        if (roomRes.status === 404) {
          setRoom(null);
          setRoomLoading(false);
          return;
        }
        const roomData = await roomRes.json();
        setRoom(roomData);
        setSelectedModulId(roomData.modulId);

        // Fetch Modules & materials
        const modulesRes = await fetch(getBackendUrl('/api/modules'));
        const modulesJson = await modulesRes.json();
        setModulesData(modulesJson);

        // JWT verification
        const savedToken = localStorage.getItem(`quiz_student_token_${roomCode}`);
        if (savedToken) {
          const meRes = await fetch(getBackendUrl('/api/me'), {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          if (meRes.status === 200) {
            const meData = await meRes.json();
            setStudentName(meData.name);
            setIsNameSubmitted(true);
            if (roomData.status === 'lobby' && meData.step !== 'finished') {
              setStep('lobby');
            } else {
              setStep(meData.step || 'select-module');
            }
            if (meData.selectedModulId) setSelectedModulId(meData.selectedModulId);
            setMaterialIdx(meData.materialIdx || 0);
            setCurrentQuestionIdx(meData.currentQuestionIdx || 0);
            setScore(meData.score || 0);
            setReadSlidesGlobal(meData.progress || []);

            // Connect WebSocket
            connectWebSocket(savedToken);
          } else {
            localStorage.removeItem(`quiz_student_token_${roomCode}`);
            setStep('intro');
          }
        } else {
          setStep('intro');
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setRoomLoading(false);
      }
    };

    loadInitialData();
  }, [roomCode]);

  // 3. WebSocket Setup
  const connectWebSocket = (token) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(getBackendUrl(`/ws?token=${token}`, true));
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Student WS Connected successfully');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Received WebSocket event:', msg);

        switch (msg.type) {
          case 'RESUME_STATE': {
            const d = msg.data;
            if (d.step) setStep(d.step);
            if (d.selectedModulId) setSelectedModulId(d.selectedModulId);
            if (d.materialIdx !== undefined) setMaterialIdx(d.materialIdx);
            if (d.currentQuestionIdx !== undefined) setCurrentQuestionIdx(d.currentQuestionIdx);
            if (d.score !== undefined) setScore(d.score);
            if (d.progress) setReadSlidesGlobal(d.progress);
            if (d.timeLeft !== undefined && d.step === 'quiz') setTimeLeft(d.timeLeft);
            break;
          }
          case 'GAME_STARTED': {
            setRoom(prev => prev ? { ...prev, status: 'active' } : prev);
            setStep('select-module');
            break;
          }
          case 'ROOM_CANCELLED': {
            showModal({
              title: 'Sesi Dibatalkan',
              message: 'Sesi kuis telah dibatalkan oleh guru. Anda akan dikembalikan ke halaman beranda.',
              type: 'warning',
              icon: '🛑',
              onClose: () => {
                localStorage.removeItem(`quiz_student_token_${roomCode}`);
                window.location.href = '/';
              },
              confirmText: 'KEMBALI KE BERANDA'
            });
            break;
          }
          case 'QUIZ_QUESTION': {
            setCurrentQuestionIdx(msg.data.questionIdx);
            setTimeLeft(msg.data.timeLeft);
            setIsAnswered(false);
            setSelectedKey(null);
            break;
          }
          case 'ANSWER_RESULT': {
            const d = msg.data;
            setIsAnswered(true);
            setSelectedKey(prev => prev || 'TIMEOUT');
            if (d.isCorrect) {
              setCorrectCount((prev) => prev + 1);
            }
            setScore(d.score);

            // Wait and advance question
            setTimeout(() => {
              const totalQuestions = Object.values(modulesData).reduce((acc, m) => acc + (m.questions?.length || 0), 0);
              if (d.nextQuestionIdx < totalQuestions) {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'GET_NEXT_QUESTION' }));
                }
              } else {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'FINISH_QUIZ' }));
                }
                setStep('finished');
              }
            }, 2500);
            break;
          }
          case 'ERROR': {
            showModal({
              title: 'Terjadi Kesalahan',
              message: msg.message || 'Terjadi kesalahan pada koneksi WebSocket.',
              type: 'error',
              icon: '❌'
            });
            break;
          }
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Student WS Closed.');
    };
  };

  // Close WebSocket on cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 4. Timer Logic
  useEffect(() => {
    if (step !== 'quiz') return;

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
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIdx, step]);

  // 5. Track slide reading progress in DB
  useEffect(() => {
    if (step === 'materials' && selectedModulId && materialIdx !== undefined) {
      const slideKey = `${selectedModulId}_${materialIdx}`;
      setReadSlidesGlobal((prev) => {
        if (prev.includes(slideKey)) return prev;
        return [...prev, slideKey];
      });

      // Send to server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'UPDATE_PROGRESS',
          slideKey,
          selectedModulId,
          materialIdx,
          step: 'materials'
        }));
      }
    }
  }, [materialIdx, selectedModulId, step]);

  // Scoreboard polling on finished screen
  useEffect(() => {
    if (step === 'finished' && roomCode) {
      const fetchScoreboard = async () => {
        try {
          const res = await fetch(getBackendUrl(`/api/rooms/${roomCode}/students`));
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map(s => ({
              name: s.name,
              score: s.score,
              isPlayer: s.name === studentName
            }));
            mapped.sort((a, b) => b.score - a.score);
            setScoreboardStudents(mapped);
          }
        } catch (err) {
          console.error('Error fetching scoreboard:', err);
        }
      };

      fetchScoreboard();
      const interval = setInterval(fetchScoreboard, 2500);
      return () => clearInterval(interval);
    }
  }, [step, roomCode, studentName]);

  // Helpers
  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedKey('TIMEOUT');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBMIT_ANSWER',
        optionKey: 'TIMEOUT'
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
        type: 'SUBMIT_ANSWER',
        optionKey: option.key
      }));
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const res = await fetch(getBackendUrl('/api/rooms/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, name: nameInput })
      });
      const data = await res.json();
      if (data.error) {
        showModal({
          title: 'Gagal Bergabung',
          message: data.error,
          type: 'error',
          icon: '❌'
        });
        return;
      }

      localStorage.setItem(`quiz_student_token_${roomCode}`, data.token);
      setStudentName(data.student.name);
      setIsNameSubmitted(true);

      connectWebSocket(data.token);

      if (room.status === 'lobby') {
        setStep('lobby');
      } else {
        setStep('select-module');
      }
    } catch (err) {
      console.error(err);
      showModal({
        title: 'Koneksi Gagal',
        message: 'Gagal mendaftarkan nama ke server. Pastikan koneksi internet Anda stabil dan coba lagi.',
        type: 'error',
        icon: '📡'
      });
    }
  };

  const navigateToSelectModule = () => {
    setStep('select-module');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SELECT_MODULE',
        selectedModulId,
        step: 'select-module',
        materialIdx: 0
      }));
    }
  };

  const getRankBadge = () => {
    const total = questions.length || 7;
    const ratio = correctCount / total;

    if (ratio === 1) return { name: 'Garuda Emas 🥇', desc: 'Sempurna! Kamu memahami seluruh materi dengan sangat baik.', color: 'bg-neo-yellow text-black' };
    if (ratio >= 0.7) return { name: 'Banteng Merdeka 🐂', desc: 'Luar Bisa! Pemahaman materi kamu sangat kuat.', color: 'bg-neo-pink text-white' };
    if (ratio >= 0.5) return { name: 'Pohon Beringin 🌳', desc: 'Bagus Sekali! Kamu mengerti dasar-dasar materi.', color: 'bg-neo-green text-black' };
    return { name: 'Bintang Harapan ⭐', desc: 'Ayo belajar lagi materinya dan coba lagi nanti.', color: 'bg-neo-blue text-white' };
  };

  // Rendering screens
  if (roomLoading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full neo-box bg-white p-8 text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-neo-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-bold text-gray-700">Menghubungkan ke server kelas...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full neo-box bg-[#FFE6CC] p-8 text-center space-y-6">
          <span className="text-5xl">🛑</span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Room Tidak Ditemukan
          </h1>
          <p className="text-sm font-semibold text-gray-700 leading-relaxed">
            Kode room kuis <strong className="underline text-black">{roomCode}</strong> tidak terdaftar dalam database kami. Silakan cek kembali kodenya!
          </p>
          <a href="/" className="w-full py-3 neo-btn bg-neo-pink text-white text-xs block text-center">
            KEMBALI KE BERANDA 🏠
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl bg-neo-yellow p-1.5 neo-border shadow-sm">🇮🇩</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1">
                PANCASILA <span className="bg-neo-yellow px-1 neo-border shadow-sm border-black">FUN LEARNING</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Kamar Kelas: {roomCode} | {room.quizTitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(`quiz_student_token_${roomCode}`);
              window.location.href = '/';
            }}
            className="neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100"
          >
            <span>KELUAR KELAS</span>
            <span>🏠</span>
          </button>
        </header>

        {/* 1. NAME REGISTRATION (INTRO STEP) */}
        {step === 'intro' && !isNameSubmitted && (
          <div className="max-w-md mx-auto neo-box bg-[#FAF6EE] p-5 sm:p-8 rounded-none">
            <div className="mb-6 text-center">
              <span className="bg-neo-pink text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
                Guru: {room.mentorName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2">
                Siapa Namamu? ✏️
              </h2>
              <p className="text-gray-700 text-sm mt-1 font-semibold">
                Tulis nama lengkapmu untuk memulai sesi belajar & kuis interaktif di sekolah <strong className="underline">{room.schoolName}</strong>.
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Contoh: Rizal Ramadhan"
                  className="w-full p-3 sm:p-4 rounded-none neo-input bg-white text-base sm:text-lg font-bold"
                  maxLength={20}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 sm:py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2 font-black"
              >
                <span>MULAI MATERI PEMBELAJARAN</span>
                <span>🔥</span>
              </button>
            </form>
          </div>
        )}

        {/* 1.2 LOBBY WAITING STEP */}
        {step === 'lobby' && (
          <QuizLobby
            role="student"
            roomCode={roomCode}
            quizTitle={room.quizTitle}
            studentName={studentName}
            onCancel={() => {
              localStorage.removeItem(`quiz_student_token_${roomCode}`);
              window.location.href = '/';
            }}
          />
        )}

        {/* WAITING SCREEN - when room is still in lobby and student joined */}
        {step === 'select-module' && room && room.status === 'lobby' && (
          <div className="max-w-lg mx-auto space-y-6 animate-fadeIn">
            <div className="neo-box bg-[#FFF8E1] p-8 text-center space-y-6">
              {/* Animated waiting icon */}
              <div className="relative inline-block">
                <span className="text-6xl inline-block" style={{ animation: 'neoWaitingBounce 1.5s ease-in-out infinite' }}>⏳</span>
              </div>

              <div className="space-y-2">
                <span className="bg-neo-yellow text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm inline-block">
                  Menunggu Guru
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  Tunggu Guru Memulai!
                </h2>
                <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                  Halo <strong className="text-black underline">{studentName}</strong>, guru belum menekan tombol <strong className="bg-neo-green/20 px-1">"Mulai Pertandingan"</strong>. 
                  Modul dan kuis akan terbuka otomatis setelah guru memulai sesi.
                </p>
              </div>

              {/* Animated dots */}
              <div className="flex justify-center items-center gap-2 pt-2">
                <span className="w-3 h-3 bg-neo-yellow neo-border inline-block" style={{ animation: 'neoDotPulse 1.2s ease-in-out infinite' }} />
                <span className="w-3 h-3 bg-neo-pink neo-border inline-block" style={{ animation: 'neoDotPulse 1.2s ease-in-out 0.2s infinite' }} />
                <span className="w-3 h-3 bg-neo-blue neo-border inline-block" style={{ animation: 'neoDotPulse 1.2s ease-in-out 0.4s infinite' }} />
                <span className="w-3 h-3 bg-neo-green neo-border inline-block" style={{ animation: 'neoDotPulse 1.2s ease-in-out 0.6s infinite' }} />
              </div>

              {/* Room info card */}
              <div className="neo-box bg-white p-4 text-left space-y-2">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-500">Room Code</span>
                  <span className="bg-neo-yellow px-2 py-0.5 neo-border shadow-sm text-black">{roomCode}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-500">Kuis</span>
                  <span className="text-black">{room.quizTitle}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-500">Guru</span>
                  <span className="text-black">{room.mentorName}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-500">Status</span>
                  <span className="bg-neo-pink/20 text-neo-pink px-2 py-0.5 neo-border shadow-sm animate-pulse">BELUM DIMULAI</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(`quiz_student_token_${roomCode}`);
                  window.location.href = '/';
                }}
                className="w-full py-3 neo-btn bg-white text-black text-xs font-black"
              >
                KELUAR KELAS 🏠
              </button>
            </div>

            <style>{`
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
            `}</style>
          </div>
        )}

        {/* 1.5 SELECT MODULE STEP */}
        {step === 'select-module' && room && room.status !== 'lobby' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Global Progress Tracker & Unified Quiz Card */}
            <div className="neo-box bg-[#EBF4F6] p-6 space-y-4">
              <div>
                <span className="bg-neo-yellow text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
                  Progres Belajar Global
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1">
                  Halo {studentName}, Pelajari Semua Modul! 📚
                </h2>
                <p className="text-gray-700 text-xs font-semibold mt-1">
                  Kamu harus membaca seluruh materi di semua modul di bawah ({totalMaterialsCount} slide) untuk membuka Kuis Utama Gabungan!
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>📖 Total Materi Dibaca:</span>
                  <span className="text-neo-blue">{Math.round(globalProgressPercent)}% Selesai</span>
                </div>
                <div className="h-6 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative">
                  <div
                    className="h-full bg-neo-green border-r-[3px] border-black transition-all duration-300"
                    style={{ width: `${globalProgressPercent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-black select-none">
                    {readSlidesGlobal.length} dari {totalMaterialsCount} Slide Selesai Dibaca
                  </span>
                </div>
              </div>

              {/* Unified Global Quiz Launcher Button */}
              <div className="pt-2">
                {globalProgressPercent < 100 ? (
                  <button
                    disabled
                    type="button"
                    className="w-full py-4 neo-btn bg-gray-200 text-gray-400 text-sm font-black border-dashed cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🔒 KUIS UTAMA TERKUNCI (BACA SEMUA MATERI)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'START_QUIZ' }));
                      }
                      setStep('quiz');
                    }}
                    className="w-full py-4 neo-btn bg-neo-yellow text-black text-sm font-black animate-pulse flex items-center justify-center gap-2 hover:bg-neo-yellow/90"
                  >
                    <span>🔥 MULAI KUIS UTAMA PANCASILA ({questions.length} SOAL) ⚡</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allModules.map((m) => {
                const materialsList = m.materials || [];
                const moduleReadCount = materialsList.filter((_, sIdx) => readSlidesGlobal.includes(`${m.id}_${sIdx}`)).length;
                const isModuleFinished = materialsList.length > 0 && moduleReadCount === materialsList.length;

                return (
                  <div
                    key={m.id}
                    className={`relative neo-box p-6 flex flex-col justify-between space-y-6 hover:scale-102 transition-transform ${
                      isModuleFinished ? 'bg-[#F1FCF6]' : 'bg-white'
                    }`}
                  >
                    {/* Completion Badge */}
                    {isModuleFinished && (
                      <div className="absolute -top-3 -right-3 bg-neo-green text-black font-black text-[10px] px-2.5 py-1 uppercase tracking-wider neo-border shadow-sm rotate-6 z-10 animate-bounce">
                        SELESAI ✅
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border shadow-sm rounded-none ${isModuleFinished ? 'bg-neo-green/30 border-neo-green text-green-800' : 'bg-neo-yellow/30 border-neo-yellow text-yellow-800'}`}>
                          📂 {moduleReadCount}/{materialsList.length} Materi Dibaca
                        </span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">{m.title}</h3>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">{m.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModulId(m.id);
                        setMaterialIdx(0);
                        
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                          wsRef.current.send(JSON.stringify({
                            type: 'SELECT_MODULE',
                            selectedModulId: m.id,
                            step: 'materials',
                            materialIdx: 0
                          }));
                        }
                        setStep('materials');
                      }}
                      className={`w-full py-3 neo-btn text-xs font-black transition-all ${
                        isModuleFinished
                          ? 'bg-white text-black hover:bg-gray-100'
                          : 'bg-neo-blue text-white hover:bg-neo-blue/90'
                      }`}
                    >
                      {isModuleFinished ? '📖 BACA ULANG MATERI' : '📚 BACA MATERI MODUL'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. MATERIALS FLOW (SLIDE-BY-SLIDE) */}
        {step === 'materials' && modul && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Slide Header Indicator */}
            <div className="flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider">
              <span className="bg-neo-blue text-white px-2.5 py-0.5 neo-border text-[10px] font-black">
                MODUL: {modul.title}
              </span>
              <span className="text-black">
                MATERI {materialIdx + 1} / {materials.length}
              </span>
            </div>

            {/* Progres Belajar Bar */}
            <div className="neo-box bg-white p-4 space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-wide">
                <span className="text-gray-700">📖 Slide Ke {materialIdx + 1} dari {materials.length}</span>
                <span className="text-neo-blue">Progres Global: {Math.round(globalProgressPercent)}%</span>
              </div>
              
              {/* Global Progress Bar */}
              <div className="h-5 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative">
                <div
                  className="h-full bg-neo-green border-r-[2px] border-black transition-all duration-300"
                  style={{ width: `${globalProgressPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black">
                  Total Terbaca: {readSlidesGlobal.length} dari {totalMaterialsCount} Slide Modul
                </span>
              </div>
            </div>

            {/* Slide Content Box */}
            {materials[materialIdx] && (
              <div className="neo-box bg-white p-6 sm:p-10 space-y-6 relative overflow-hidden">
                <div className="flex items-center gap-4 border-b-2 border-black pb-4">
                  <span className="text-4xl p-2 bg-[#EBF4F6] neo-border shadow-sm shrink-0">
                    {materials[materialIdx].icon || '📚'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-black leading-tight">
                    {materials[materialIdx].title}
                  </h3>
                </div>

                <div className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed whitespace-pre-line p-2 bg-gray-50 neo-border border-dashed">
                  {materials[materialIdx].content}
                </div>
              </div>
            )}

            {/* Slide Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                disabled={materialIdx === 0}
                onClick={() => setMaterialIdx((prev) => prev - 1)}
                className="flex-1 py-4 neo-btn bg-white text-black text-xs disabled:opacity-40 disabled:cursor-not-allowed font-black"
              >
                ⬅️ SEBELUMNYA
              </button>

              <button
                type="button"
                onClick={navigateToSelectModule}
                className="flex-1 py-4 neo-btn bg-neo-pink text-white text-xs font-black"
              >
                📋 PILIH MODUL LAIN
              </button>

              {materialIdx < materials.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setMaterialIdx((prev) => prev + 1)}
                  className="flex-1 py-4 neo-btn bg-neo-blue text-white text-xs font-black"
                >
                  LANJUTKAN ➡️
                </button>
              ) : (
                <button
                  type="button"
                  onClick={navigateToSelectModule}
                  className="flex-1 py-4 neo-btn bg-neo-green text-black text-xs font-black animate-bounce"
                >
                  📋 SELESAI BACA & KEMBALI
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. INTERACTIVE QUIZ PLAY (QUESTION-BY-QUESTION) */}
        {step === 'quiz' && questions[currentQuestionIdx] && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Top HUD */}
            <div className="flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="bg-neo-yellow text-black px-2 py-0.5 neo-border text-[10px] font-black">
                  SOAL {currentQuestionIdx + 1}/{questions.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>WAKTU:</span>
                  <span className={`w-8 h-8 flex items-center justify-center neo-border text-xs font-black ${timeLeft <= 5 ? 'bg-neo-pink text-white animate-bounce' : 'bg-white text-black'}`}>
                    {timeLeft}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>SKOR:</span>
                  <span className="text-neo-blue">{score}</span>
                </div>
              </div>
            </div>

            {/* Question Text Card */}
            <div className="neo-box bg-[#FAF6EE] p-6 sm:p-8 rounded-none">
              <h3 className="text-lg sm:text-xl font-black uppercase text-black leading-relaxed">
                {questions[currentQuestionIdx].question}
              </h3>
            </div>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestionIdx].options.map((option) => {
                let style = 'bg-white hover:bg-[#FAF6EE] cursor-pointer';

                if (isAnswered) {
                  if (option.isCorrect) {
                    style = 'bg-neo-green text-black border-black shadow-sm';
                  } else if (selectedKey === option.key) {
                    style = 'bg-neo-pink text-white border-black shadow-sm';
                  } else {
                    style = 'bg-gray-100 text-gray-400 opacity-60 pointer-events-none';
                  }
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    className={`w-full p-4 text-left font-bold neo-border text-sm sm:text-base flex items-center gap-4 transition-all duration-100 ${style}`}
                  >
                    <span className="w-7 h-7 shrink-0 rounded-none border-[2px] border-black bg-black text-white flex items-center justify-center text-xs font-extrabold">
                      {option.key}
                    </span>
                    <span className="uppercase tracking-tight leading-tight">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswered && (
              <div className="neo-box bg-[#EBF4F6] p-4 animate-fadeIn">
                <h4 className="text-xs uppercase font-extrabold text-neo-blue mb-1">💡 Penjelasan Soal</h4>
                <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                  {selectedKey === 'TIMEOUT' ? (
                    <span className="text-red-600 font-bold block mb-1">⏳ Waktu habis!</span>
                  ) : null}
                  {questions[currentQuestionIdx].explanation}
                </p>
              </div>
            )}
            
            {/* Return to modules choice */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={navigateToSelectModule}
                className="px-6 py-3 neo-btn bg-neo-pink text-white text-xs font-black tracking-wider w-full sm:w-auto"
              >
                🛑 BATALKAN KUIS & GANTI MODUL
              </button>
            </div>
          </div>
        )}

        {/* 4. RESULTS / SCOREBOARD */}
        {step === 'finished' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="neo-box bg-[#E6FFFA] p-6 text-center">
              <span className="bg-neo-green text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
                Evaluasi Kuis
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-black mt-2">
                Kuis Selesai! 🎉
              </h2>
              <p className="text-gray-700 text-sm font-semibold mt-1">
                Hebat {studentName}, kamu telah menyelesaikan seluruh pembelajaran dan kuis untuk Room {roomCode}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score summary & badge */}
              <div className="space-y-6">
                <div className="neo-box bg-white p-6 text-center space-y-4">
                  <p className="text-xs uppercase font-extrabold tracking-wider text-gray-500">Skor Akhir</p>
                  <div className="text-5xl font-black text-neo-blue">{score} Poin</div>
                  <div className="text-sm font-extrabold text-black">
                    Benar: <span className="text-neo-green">{correctCount}</span> dari {questions.length} Pertanyaan
                  </div>

                  {/* Badge */}
                  {(() => {
                    const badge = getRankBadge();
                    return (
                      <div className={`neo-box ${badge.color} p-4 text-center mt-4`}>
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Gelar Kelulusan</p>
                        <h4 className="text-lg font-black uppercase mt-1">{badge.name}</h4>
                        <p className="text-xs font-medium mt-2 leading-relaxed">{badge.desc}</p>
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem(`quiz_student_token_${roomCode}`);
                    window.location.href = '/';
                  }}
                  className="w-full py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2 font-black"
                >
                  <span>KEMBALI KE BERANDA</span>
                  <span>⚡</span>
                </button>
              </div>

              {/* Scoreboard */}
              <div className="neo-box bg-white p-6 space-y-4">
                <h3 className="text-lg font-black uppercase border-b-2 border-black pb-2 text-black flex items-center justify-between">
                  <span>🏆 Papan Peringkat Kelas</span>
                </h3>

                <div className="space-y-3">
                  {scoreboardStudents.map((player, idx) => (
                    <div
                      key={player.name}
                      className={`neo-box p-3 flex items-center justify-between text-sm ${
                        player.isPlayer ? 'bg-neo-yellow/30 border-neo-yellow font-black' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold uppercase truncate max-w-[140px] sm:max-w-none">
                          {player.name} {player.isPlayer && ' (Kamu)'}
                        </span>
                      </div>
                      <div className="font-black text-black">
                        {player.score} <span className="text-[10px] font-medium text-gray-500">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
