import React, { useState } from 'react';

const INITIAL_QUIZZES = [
  { id: '1', title: 'Pancasila Fun Learning: Sila 1-5', questions: 5, category: 'Civics', difficulty: 'Mudah' },
  { id: '2', title: 'Gotong Royong & Kebhinekaan', questions: 8, category: 'Civics', difficulty: 'Sedang' },
  { id: '3', title: 'Sejarah Lahirnya Pancasila', questions: 10, category: 'Sejarah', difficulty: 'Sulit' },
  { id: '4', title: 'Norma, Hak, & Kewajiban Kelas 6', questions: 5, category: 'Civics', difficulty: 'Sedang' }
];

export default function TeacherDashboard({ user, onLogout, onLaunchLobby }) {
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [newTitle, setNewTitle] = useState('');
  const [newQuestionsCount, setNewQuestionsCount] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQuiz = {
      id: String(quizzes.length + 1),
      title: newTitle,
      questions: parseInt(newQuestionsCount),
      category: 'Pancasila Custom',
      difficulty: 'Sedang'
    };

    setQuizzes([newQuiz, ...quizzes]);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="neo-box bg-neo-yellow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-black text-white text-xs font-extrabold px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
            Ruang Mentor
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Halo, {user.name}! 📚
          </h1>
          <p className="text-black font-semibold text-sm mt-1">
            Instansi: <span className="underline decoration-2">{user.schoolName}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="neo-btn bg-neo-pink text-white px-5 py-2.5 text-sm"
        >
          KELUAR AKUN 🚪
        </button>
      </div>

      {/* Stats Card */}
      <div className="neo-box bg-[#E6FFFA] p-6 max-w-xs">
        <p className="text-xs uppercase font-extrabold tracking-wider text-gray-700">Total Kuis Aktif</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-black">{quizzes.length}</span>
          <span className="text-xs font-bold text-teal-800">Kuis Siap Pakai</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Quiz List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              📂 Daftar Kuis Pancasila
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="neo-btn bg-neo-green text-white px-4 py-2 text-xs"
            >
              {showAddForm ? 'BATALKAN' : 'BUAT KUIS BARU +'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateQuiz} className="neo-box bg-[#FAF6EE] p-5 space-y-4 animate-fadeIn">
              <h3 className="font-extrabold uppercase text-sm border-b-[2px] border-black pb-2">
                ⚙️ Parameter Kuis Baru
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-extrabold text-black">Judul Kuis</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuis Gotong Royong Kelas 5"
                    className="w-full p-2.5 rounded-none neo-input bg-white text-base sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-extrabold text-black">Jumlah Pertanyaan</label>
                  <select
                    value={newQuestionsCount}
                    onChange={(e) => setNewQuestionsCount(e.target.value)}
                    className="w-full p-2.5 rounded-none neo-input bg-white text-base sm:text-sm"
                  >
                    <option value={5}>5 Pertanyaan</option>
                    <option value={10}>10 Pertanyaan</option>
                    <option value={15}>15 Pertanyaan</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 neo-btn bg-neo-yellow text-black text-xs">
                SIMPAN KAMPANYE KUIS BARU
              </button>
            </form>
          )}

          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="neo-box bg-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:translate-x-1 transition-all"
              >
                <div>
                  <div className="flex gap-2 mb-1.5 flex-wrap">
                    <span className="bg-neo-yellow/20 text-yellow-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-yellow-800 shadow-sm rounded-none">
                      {quiz.category}
                    </span>
                    <span className="bg-neo-pink/20 text-red-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-red-800 shadow-sm rounded-none">
                      {quiz.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-black">{quiz.title}</h3>
                  <p className="text-gray-600 text-xs mt-0.5 font-medium">
                    Total: <strong className="text-black">{quiz.questions} Soal</strong> | Berbasis Standar Kurikulum Merdeka
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onLaunchLobby(quiz)}
                    className="flex-1 sm:flex-none neo-btn bg-neo-green text-white px-5 py-3 text-sm flex items-center justify-center gap-2"
                  >
                    <span>MULAI ROOM</span>
                    <span>🚀</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Info Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            📢 Informasi Sesi
          </h2>

          <div className="neo-box bg-neo-pink/10 p-6 space-y-4">
            <h3 className="text-md font-black uppercase border-b-2 border-black pb-2 text-neo-pink">
              Panduan Guru Kuis
            </h3>
            <ul className="text-xs font-bold text-gray-800 space-y-3">
              <li className="flex gap-2">
                <span className="text-neo-pink">1.</span>
                <span>Pilih salah satu kuis Pancasila di samping lalu tekan tombol <strong>MULAI ROOM</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neo-pink">2.</span>
                <span>Bagikan <strong>6 digit kode kuis</strong> yang muncul kepada siswa Anda.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neo-pink">3.</span>
                <span>Siswa akan mengetik kode tersebut di HP/Laptop mereka dan menuliskan nama lengkap mereka.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neo-pink">4.</span>
                <span>Ketika semua siswa sudah masuk ke lobby, klik <strong>MULAI PERTANDINGAN</strong> untuk memulai kuis secara serempak!</span>
              </li>
            </ul>
          </div>

          <div className="neo-box bg-neo-blue/10 p-6 space-y-3">
            <h3 className="text-md font-black uppercase text-neo-blue">
              Butuh Materi Pembelajaran?
            </h3>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              Anda memiliki file materi Pancasila di direktori kuis! Silakan gunakan materi kuis Pancasila Fun Learning untuk memperkaya soal buatan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
