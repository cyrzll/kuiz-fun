import React, { useState, useEffect } from 'react';
import RoomJoin from './RoomJoin';
import QuizLobby from './QuizLobby';
import QuizGame from './QuizGame';

export default function StudentApp() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'lobby', 'game'
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);

  // Auto-start for students waiting in the lobby
  useEffect(() => {
    if (currentView === 'lobby' && studentName) {
      const timer = setTimeout(() => {
        setCurrentView('game');
      }, 7000); // Auto start after 7 seconds for simulated flow
      return () => clearTimeout(timer);
    }
  }, [currentView, studentName]);

  const handleJoinRoom = (code) => {
    // Import dynamically to prevent SSR resolution issues
    import('astro:transitions/client').then(({ navigate }) => {
      navigate(`/games?code=${code}`);
    }).catch(() => {
      window.location.href = `/games?code=${code}`;
    });
  };

  const handleCancelLobby = () => {
    setStudentName('');
    setRoomCode('');
    setCurrentView('landing');
  };

  const handleFinishQuiz = () => {
    setStudentName('');
    setRoomCode('');
    setCurrentView('landing');
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl bg-neo-yellow p-1.5 neo-border shadow-sm">🇮🇩</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1">
                PANCASILA <span className="bg-neo-yellow px-1 neo-border shadow-sm border-black">FUN QUIZ</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Portal Siswa - Arena Belajar Interaktif
              </p>
            </div>
          </div>
          <a
            href="/auth"
            className="neo-btn bg-neo-yellow text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-neo-yellow/90"
          >
            <span>MASUK SEBAGAI GURU</span>
            <span>🔑</span>
          </a>
        </header>

        {/* View Router */}
        {currentView === 'landing' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#FAF6EE] neo-box p-5 border-dashed border-gray-400">
              <span className="text-[10px] font-black uppercase tracking-widest bg-neo-blue text-white px-2 py-0.5 neo-border shadow-sm">Bermain Kuis</span>
              <p className="text-xs font-semibold text-gray-700 mt-2">
                Tidak butuh pembuatan akun bagi siswa! Cukup masukkan 6 digit kode room kuis yang dibagikan oleh guru di papan tulis untuk mulai bermain.
              </p>
            </div>
            
            <RoomJoin onJoinRoom={handleJoinRoom} />

            {/* Pancasila Promo Banner */}
            <div className="neo-box bg-neo-green/10 p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neo-green/20 rounded-full translate-x-8 -translate-y-8 pointer-events-none"></div>
              <h3 className="text-md font-black uppercase text-green-800">
                🇮🇩 Cintai Tanah Air & Pancasila
              </h3>
              <p className="text-xs text-green-950 font-bold leading-relaxed">
                Asah pemahamanmu tentang simbol, nilai-nilai, dan sejarah Pancasila dengan platform kuis interaktif yang asyik dan menantang!
              </p>
            </div>
          </div>
        )}

        {currentView === 'lobby' && (
          <QuizLobby
            role="student"
            roomCode={roomCode}
            quizTitle={activeQuiz?.title || 'Kuis Kustom'}
            onStartGame={() => setCurrentView('game')}
            onCancel={handleCancelLobby}
            studentName={studentName}
            setStudentName={setStudentName}
          />
        )}

        {currentView === 'game' && (
          <QuizGame
            studentName={studentName}
            roomCode={roomCode}
            onFinish={handleFinishQuiz}
          />
        )}

      </div>
    </main>
  );
}
