import React, { useState, useEffect } from 'react';
import AuthCard from './AuthCard';
import RoomJoin from './RoomJoin';
import TeacherDashboard from './TeacherDashboard';
import QuizLobby from './QuizLobby';
import QuizGame from './QuizGame';

export default function MainApp() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'teacher-dashboard', 'lobby', 'student-game', 'teacher-monitor'
  const [user, setUser] = useState(null); // Teacher profile
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeRole, setActiveRole] = useState(null); // 'teacher' or 'student'
  const [monitorStudents, setMonitorStudents] = useState([]);

  // Mock auto-start for students waiting in the lobby
  useEffect(() => {
    if (currentView === 'lobby' && activeRole === 'student' && studentName) {
      const timer = setTimeout(() => {
        setCurrentView('student-game');
      }, 7000); // Auto start after 7 seconds for students
      return () => clearTimeout(timer);
    }
  }, [currentView, activeRole, studentName]);

  // Simulate student progress for the teacher monitor board
  useEffect(() => {
    if (currentView === 'teacher-monitor') {
      const initialStudents = [
        { name: 'Adit Pramono', progress: 0, score: 0 },
        { name: 'Siti Rahma', progress: 0, score: 0 },
        { name: 'Budi Santoso', progress: 0, score: 0 },
        { name: 'Gita Larasati', progress: 0, score: 0 },
        { name: 'Ahmad Syarif', progress: 0, score: 0 }
      ];
      setMonitorStudents(initialStudents);

      const interval = setInterval(() => {
        setMonitorStudents((prev) =>
          prev.map((s) => {
            if (s.progress >= 5) return s;
            const newProgress = s.progress + (Math.random() > 0.4 ? 1 : 0);
            const scoreAdd = newProgress > s.progress ? (Math.random() > 0.3 ? 100 : 0) : 0;
            return {
              ...s,
              progress: Math.min(newProgress, 5),
              score: s.score + scoreAdd
            };
          })
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentView]);

  const handleTeacherLogin = (profile) => {
    setUser(profile);
    setCurrentView('teacher-dashboard');
  };

  const handleTeacherLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const handleJoinRoom = (code) => {
    setRoomCode(code);
    setActiveRole('student');
    setActiveQuiz({ title: 'Pancasila Fun Learning: Sila 1-5' });
    setCurrentView('lobby');
  };

  const handleLaunchLobby = (quiz) => {
    setActiveQuiz(quiz);
    // Generate a random 6-digit code
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    setRoomCode(generatedCode);
    setActiveRole('teacher');
    setCurrentView('lobby');
  };

  const handleStartGame = () => {
    if (activeRole === 'teacher') {
      setCurrentView('teacher-monitor');
    } else {
      setCurrentView('student-game');
    }
  };

  const handleCancelLobby = () => {
    if (activeRole === 'teacher') {
      setCurrentView('teacher-dashboard');
    } else {
      setStudentName('');
      setRoomCode('');
      setCurrentView('landing');
    }
  };

  const handleFinishQuiz = () => {
    setStudentName('');
    setRoomCode('');
    setCurrentView('landing');
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl bg-neo-yellow p-1.5 neo-border shadow-sm">🇮🇩</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1">
                PANCASILA <span className="bg-neo-yellow px-1 neo-border shadow-sm border-black">FUN QUIZ</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Neobrutalism Interactive Learning Arena
              </p>
            </div>
          </div>


        </header>

        {/* View Router */}
        {currentView === 'landing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side: Mentor Login/Register */}
            <div className="space-y-4">
              <div className="bg-white neo-box p-4 border-dashed border-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest bg-neo-pink text-white px-2 py-0.5 neo-border shadow-sm">Portal Pendidik</span>
                <p className="text-xs font-semibold text-gray-700 mt-2">
                  Masuk sebagai guru untuk membuat kelas kuis Pancasila kustom Anda sendiri, mengunduh materi Pancasila, dan melihat analitik kelas secara live.
                </p>
              </div>
              <AuthCard onAuthSuccess={handleTeacherLogin} />
            </div>

            {/* Right Side: Student Join Form */}
            <div className="space-y-4">
              <div className="bg-[#FAF6EE] neo-box p-4 border-dashed border-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest bg-neo-blue text-white px-2 py-0.5 neo-border shadow-sm">Bermain Kuis</span>
                <p className="text-xs font-semibold text-gray-700 mt-2">
                  Tidak butuh akun untuk siswa! Cukup masukkan 6 digit kode room kuis yang dibagikan oleh guru di layar kelas.
                </p>
              </div>
              <RoomJoin onJoinRoom={handleJoinRoom} />

              {/* Promo Banner */}
              <div className="neo-box bg-neo-green/10 p-6 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-neo-green/20 rounded-full translate-x-8 -translate-y-8 pointer-events-none"></div>
                <h3 className="text-md font-black uppercase text-green-800">
                  🇮🇩 Berdasarkan Nilai Pancasila
                </h3>
                <p className="text-xs text-green-950 font-bold leading-relaxed">
                  Aplikasi ini dirancang dengan gaya Neobrutalism modern untuk pembelajaran Pancasila yang asyik bagi anak-anak sekolah dasar dan menengah.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'teacher-dashboard' && user && (
          <TeacherDashboard
            user={user}
            onLogout={handleTeacherLogout}
            onLaunchLobby={handleLaunchLobby}
          />
        )}

        {currentView === 'lobby' && (
          <QuizLobby
            role={activeRole}
            roomCode={roomCode}
            quizTitle={activeQuiz?.title || 'Kuis Kustom'}
            onStartGame={handleStartGame}
            onCancel={handleCancelLobby}
            studentName={studentName}
            setStudentName={setStudentName}
          />
        )}

        {currentView === 'student-game' && (
          <QuizGame
            studentName={studentName}
            roomCode={roomCode}
            onFinish={handleFinishQuiz}
          />
        )}

        {currentView === 'teacher-monitor' && (
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
                  Melihat kemajuan siswa secara real-time pada kuis: <span className="underline decoration-2">{activeQuiz?.title}</span> (Room: {roomCode})
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('teacher-dashboard');
                  setActiveQuiz(null);
                  setRoomCode('');
                }}
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
                  const percent = (s.progress / 5) * 100;
                  const isDone = s.progress === 5;
                  return (
                    <div key={s.name} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-extrabold uppercase">
                        <span className="flex items-center gap-2">
                          <span>👤</span> {s.name}
                        </span>
                        <span className="text-xs">
                          {isDone ? (
                            <span className="bg-neo-green text-black px-2 py-0.5 text-[10px] neo-border font-black">
                              SELESAI
                            </span>
                          ) : (
                            `Soal ${s.progress}/5`
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
              💡 Ini adalah simulasi pengerjaan kelas. Untuk menguji sisi siswa secara nyata, buka tab browser baru (Incognito/Private) atau device lain, kunjungi website ini, lalu masukkan Room Code: <strong className="underline text-black">{roomCode}</strong>.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
