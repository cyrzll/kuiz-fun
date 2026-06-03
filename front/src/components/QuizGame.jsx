import React, { useState, useEffect, useRef } from 'react';

const QUESTIONS = [
  {
    id: 1,
    question: 'Sila ketiga Pancasila, "Persatuan Indonesia", dilambangkan oleh simbol apa?',
    options: [
      { key: 'A', text: 'Bintang Emas' },
      { key: 'B', text: 'Pohon Beringin', isCorrect: true },
      { key: 'C', text: 'Kepala Banteng' },
      { key: 'D', text: 'Padi dan Kapas' }
    ],
    explanation: 'Sila ke-3 "Persatuan Indonesia" dilambangkan dengan Pohon Beringin yang mencerminkan tempat berteduh dan persatuan seluruh rakyat Indonesia.'
  },
  {
    id: 2,
    question: 'Sikap menghormati kebebasan beribadah bagi pemeluk agama lain merupakan perwujudan pengamalan Pancasila, khususnya sila ke-...',
    options: [
      { key: 'A', text: 'Sila ke-1 (Ketuhanan Yang Maha Esa)', isCorrect: true },
      { key: 'B', text: 'Sila ke-2 (Kemanusiaan yang adil dan beradab)' },
      { key: 'C', text: 'Sila ke-3 (Persatuan Indonesia)' },
      { key: 'D', text: 'Sila ke-5 (Keadilan sosial bagi seluruh rakyat)' }
    ],
    explanation: 'Sila ke-1 menekankan nilai toleransi, kebebasan beragama, dan saling menghormati antarumat beragama.'
  },
  {
    id: 3,
    question: 'Menolong teman yang terjatuh atau membantu korban bencana alam tanpa membeda-bedakan latar belakang merupakan pengamalan sila ke-...',
    options: [
      { key: 'A', text: 'Sila ke-1 (Ketuhanan Yang Maha Esa)' },
      { key: 'B', text: 'Sila ke-2 (Kemanusiaan yang adil dan beradab)', isCorrect: true },
      { key: 'C', text: 'Sila ke-4 (Kerakyatan yang dipimpin oleh hikmat...)' },
      { key: 'D', text: 'Sila ke-5 (Keadilan sosial bagi seluruh rakyat)' }
    ],
    explanation: 'Membantu sesama manusia secara adil dan beradab tanpa membedakan suku/ras merupakan wujud nyata nilai kemanusiaan (Sila ke-2).'
  },
  {
    id: 4,
    question: 'Bunyi sila keempat Pancasila berkaitan erat dengan nilai musyawarah dan demokrasi. Apa lambang dari sila keempat?',
    options: [
      { key: 'A', text: 'Rantai Emas' },
      { key: 'B', text: 'Padi dan Kapas' },
      { key: 'C', text: 'Kepala Banteng', isCorrect: true },
      { key: 'D', text: 'Pohon Beringin' }
    ],
    explanation: 'Sila ke-4 dilambangkan dengan Kepala Banteng yang melambangkan hewan sosial yang suka berkumpul, sama seperti manusia saat bermusyawarah.'
  },
  {
    id: 5,
    question: 'Menjaga keseimbangan antara hak dan kewajiban serta menghormati hak-hak orang lain merupakan wujud pengamalan sila ke-...',
    options: [
      { key: 'A', text: 'Sila ke-2 (Kemanusiaan yang adil dan beradab)' },
      { key: 'B', text: 'Sila ke-3 (Persatuan Indonesia)' },
      { key: 'C', text: 'Sila ke-4 (Kerakyatan yang dipimpin oleh hikmat...)' },
      { key: 'D', text: 'Sila ke-5 (Keadilan sosial bagi seluruh rakyat)', isCorrect: true }
    ],
    explanation: 'Sila ke-5 berfokus pada keadilan sosial, keseimbangan hak-kewajiban, dan sikap adil terhadap sesama.'
  }
];

export default function QuizGame({ studentName, roomCode, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState('playing'); // 'playing' or 'finished'
  const timerRef = useRef(null);

  const currentQuestion = QUESTIONS[currentIdx];

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    setTimeLeft(15);
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
  }, [currentIdx, gameState]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedKey('TIMEOUT');
    // Transition to next after 2.5s
    setTimeout(() => {
      moveToNext();
    }, 2500);
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedKey(option.key);
    setIsAnswered(true);

    let isCorrect = option.isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 100 + timeLeft * 5); // Speed bonus!
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(() => {
      moveToNext();
    }, 2500);
  };

  const moveToNext = () => {
    setSelectedKey(null);
    setIsAnswered(false);
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setGameState('finished');
    }
  };

  const getRankBadge = () => {
    if (correctCount === 5) return { name: 'Garuda Emas 🥇', desc: 'Sempurna! Kamu memahami seluruh pengamalan Pancasila dengan sangat baik.', color: 'bg-neo-yellow text-black' };
    if (correctCount === 4) return { name: 'Banteng Merdeka 🐂', desc: 'Luar Biasa! Pemahaman Pancasila kamu sangat kuat dan kokoh.', color: 'bg-neo-pink text-white' };
    if (correctCount === 3) return { name: 'Pohon Beringin 🌳', desc: 'Bagus Sekali! Kamu mengerti dasar-dasar pemahaman Pancasila.', color: 'bg-neo-green text-black' };
    if (correctCount >= 1) return { name: 'Rantai Persatuan ⛓️', desc: 'Cukup Baik. Yuk baca-baca lagi materi Pancasila agar semakin paham.', color: 'bg-neo-blue text-white' };
    return { name: 'Bintang Harapan ⭐', desc: 'Jangan menyerah! Ayo belajar lagi materi Pancasila dan coba lagi.', color: 'bg-gray-400 text-black' };
  };

  const getScoreboard = () => {
    // Generate mock scores for classmates based on random probabilities
    const leaderboard = [
      { name: studentName || 'Siswa', score: score, isPlayer: true },
      { name: 'Ahmad Syarif', score: 480 },
      { name: 'Siti Rahma', score: 520 },
      { name: 'Gita Larasati', score: 380 },
      { name: 'Adit Pramono', score: 290 }
    ];
    return leaderboard.sort((a, b) => b.score - a.score);
  };

  if (gameState === 'finished') {
    const badge = getRankBadge();
    const scoreboard = getScoreboard();
    const rankIndex = scoreboard.findIndex((s) => s.isPlayer) + 1;

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Header */}
        <div className="neo-box bg-[#E6FFFA] p-6 text-center">
          <span className="bg-neo-green text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
            Kuis Selesai
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-black mt-2">
            Hasil Akhir Kuis 🎉
          </h2>
          <p className="text-gray-700 text-sm font-semibold mt-1">
            Kerja bagus! Kuis Room <strong className="text-black">{roomCode}</strong> telah selesai dimainkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Badge & Score Card */}
          <div className="space-y-6">
            <div className="neo-box bg-white p-6 text-center space-y-4">
              <p className="text-xs uppercase font-extrabold tracking-wider text-gray-500">Skor Kamu</p>
              <div className="text-5xl font-black text-neo-blue">{score} Poin</div>
              <div className="text-sm font-extrabold text-black">
                Menjawab Benar: <span className="text-neo-green">{correctCount}</span> dari 5 Soal
              </div>

              {/* Badge Display */}
              <div className={`neo-box ${badge.color} p-4 text-center mt-4`}>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-80">GELAR / PANGKAT</p>
                <h4 className="text-xl font-black uppercase mt-1">{badge.name}</h4>
                <p className="text-xs font-medium mt-2 leading-relaxed">{badge.desc}</p>
              </div>
            </div>

            <button
              onClick={onFinish}
              className="w-full py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2"
            >
              <span>KEMBALI KE BERANDA</span>
              <span>⚡</span>
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="neo-box bg-white p-6 space-y-4">
            <h3 className="text-lg font-black uppercase border-b-2 border-black pb-2 text-black flex items-center justify-between">
              <span>🏆 Papan Peringkat</span>
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                Peringkat #{rankIndex}
              </span>
            </h3>

            <div className="space-y-3">
              {scoreboard.map((player, idx) => (
                <div
                  key={player.name}
                  className={`neo-box p-3 flex items-center justify-between text-sm ${
                    player.isPlayer ? 'bg-neo-yellow/30 border-neo-yellow' : 'bg-gray-50'
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
    );
  }

  // Answer state variables
  const getOptionStyle = (option) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-[#FAF6EE] cursor-pointer';
    }

    if (option.isCorrect) {
      return 'bg-neo-green text-black border-black shadow-sm';
    }

    if (selectedKey === option.key) {
      return 'bg-neo-pink text-white border-black shadow-sm';
    }

    return 'bg-gray-100 text-gray-400 opacity-60 pointer-events-none';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Top HUD */}
      <div className="flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="bg-neo-yellow px-2 py-0.5 neo-border text-[10px] font-black">SOAL {currentIdx + 1}/5</span>
        </div>
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

      {/* Question Card */}
      <div className="neo-box bg-[#FAF6EE] p-6 sm:p-8 rounded-none relative">
        <h3 className="text-lg sm:text-xl font-black uppercase text-black leading-relaxed">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {currentQuestion.options.map((option) => {
          const optionStyle = getOptionStyle(option);
          return (
            <button
              key={option.key}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`w-full p-4 text-left font-bold neo-border text-sm sm:text-base flex items-center gap-4 transition-all duration-100 ${optionStyle}`}
            >
              <span className="w-7 h-7 shrink-0 rounded-none border-[2px] border-black bg-black text-white flex items-center justify-center text-xs font-extrabold">
                {option.key}
              </span>
              <span className="uppercase tracking-tight leading-tight">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isAnswered && (
        <div className="neo-box bg-[#EBF4F6] p-4 animate-fadeIn">
          <h4 className="text-xs uppercase font-extrabold text-neo-blue mb-1">💡 Penjelasan Jawaban</h4>
          <p className="text-xs text-gray-700 font-semibold leading-relaxed">
            {selectedKey === 'TIMEOUT' ? (
              <span className="text-red-600 font-bold block mb-1">⏳ Waktu habis!</span>
            ) : null}
            {currentQuestion.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
