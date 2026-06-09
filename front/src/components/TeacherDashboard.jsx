import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/api';
import NeoModal from './NeoModal';

export default function TeacherDashboard({ user, onLogout, onLaunchLobby }) {
  const [quizzes, setQuizzes] = useState([]);
  const [roomHistory, setRoomHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Expanded room codes state for session history accordion
  const [expandedRooms, setExpandedRooms] = useState({});

  // NeoModal state for delete confirmation and notices
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));

  const fetchData = async () => {
    try {
      // Fetch Quizzes
      const quizRes = await fetch(getBackendUrl('/api/modules'));
      if (!quizRes.ok) throw new Error('Gagal mengambil data kuis');
      const quizData = await quizRes.json();
      
      const quizList = Object.values(quizData).map((m) => {
        let difficulty = 'Mudah';
        let category = 'Civics';
        
        if (m.questions.length > 8) {
          difficulty = 'Sulit';
          category = 'Sejarah';
        } else if (m.questions.length > 5) {
          difficulty = 'Sedang';
          category = 'Pancasila';
        }

        const isSeeded = ['modul_pancasila_dasar', 'modul_gotong_royong', 'modul_sejarah_pancasila', 'modul_norma_hak_kewajiban'].includes(m.id);
        if (isSeeded) {
          if (m.id === 'modul_pancasila_dasar') { difficulty = 'Mudah'; category = 'Civics'; }
          else if (m.id === 'modul_gotong_royong') { difficulty = 'Sedang'; category = 'Civics'; }
          else if (m.id === 'modul_sejarah_pancasila') { difficulty = 'Sulit'; category = 'Sejarah'; }
          else if (m.id === 'modul_norma_hak_kewajiban') { difficulty = 'Sedang'; category = 'Civics'; }
        } else {
          category = 'Custom';
        }

        return {
          id: m.id,
          title: m.title,
          questions: m.questions.length,
          category,
          difficulty,
          description: m.description,
          isSeeded
        };
      });

      setQuizzes(quizList);

      // Fetch Room History (Session History)
      const roomRes = await fetch(getBackendUrl('/api/rooms'));
      if (!roomRes.ok) throw new Error('Gagal mengambil riwayat sesi');
      const roomData = await roomRes.json();
      setRoomHistory(roomData);

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmDelete = (quiz) => {
    showModal({
      title: 'Hapus Kuis?',
      message: `Apakah Anda yakin ingin menghapus kuis "${quiz.title}"? Tindakan ini bersifat permanen dan seluruh data soal serta slide materi akan terhapus.`,
      type: 'warning',
      icon: '🗑️',
      confirmText: 'YA, HAPUS',
      cancelText: 'BATAL',
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        try {
          const res = await fetch(getBackendUrl(`/api/modules/${quiz.id}`), {
            method: 'DELETE'
          });
          if (!res.ok) {
            let errMsg = 'Gagal menghapus kuis';
            try {
              const errData = await res.json();
              errMsg = errData.error || errMsg;
            } catch (_) {
              try {
                const text = await res.text();
                if (text) errMsg = text;
              } catch (_) {}
            }
            throw new Error(errMsg);
          }
          const data = await res.json();
          if (data.error) {
            throw new Error(data.error);
          }
          
          showModal({
            title: 'Kuis Dihapus',
            message: 'Kuis kustom Anda berhasil dihapus secara permanen dari database.',
            type: 'success',
            icon: '✅'
          });
          
          // Refresh lists
          await fetchData();
        } catch (err) {
          console.error(err);
          showModal({
            title: 'Gagal Menghapus',
            message: err.message,
            type: 'error',
            icon: '❌'
          });
          setLoading(false);
        }
      }
    });
  };

  const handleDeleteRoom = (session) => {
    showModal({
      title: 'Hapus Sesi Kuis?',
      message: `Apakah Anda yakin ingin menghapus sesi kuis dengan kode "${session.roomCode}" (${session.quizTitle})? Tindakan ini akan menghapus semua data pengerjaan siswa yang terhubung dengan sesi ini secara permanen.`,
      type: 'warning',
      icon: '🗑️',
      confirmText: 'YA, HAPUS',
      cancelText: 'BATAL',
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        try {
          const res = await fetch(getBackendUrl(`/api/rooms/${session.roomCode}`), {
            method: 'DELETE'
          });
          if (!res.ok) {
            let errMsg = 'Gagal menghapus sesi kuis';
            try {
              const errData = await res.json();
              errMsg = errData.error || errMsg;
            } catch (_) {
              try {
                const text = await res.text();
                if (text) errMsg = text;
              } catch (_) {}
            }
            throw new Error(errMsg);
          }
          const data = await res.json();
          if (data.error) {
            throw new Error(data.error);
          }
          
          showModal({
            title: 'Sesi Dihapus',
            message: 'Sesi kuis beserta seluruh data aktivitas siswa berhasil dihapus secara permanen.',
            type: 'success',
            icon: '✅'
          });
          
          // Refresh lists and stats
          await fetchData();
        } catch (err) {
          console.error(err);
          showModal({
            title: 'Gagal Menghapus Sesi',
            message: err.message,
            type: 'error',
            icon: '❌'
          });
          setLoading(false);
        }
      }
    });
  };

  const toggleExpandRoom = (roomCode) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomCode]: !prev[roomCode]
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      // SQLite datetime returns in UTC/Local. Format cleanly:
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
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

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <div className="neo-box bg-[#E6FFFA] p-6 min-w-[200px] flex-1 sm:flex-none">
          <p className="text-xs uppercase font-extrabold tracking-wider text-gray-700">Total Kuis Aktif</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black">{loading ? '...' : quizzes.length}</span>
            <span className="text-xs font-bold text-teal-800">Kuis Siap Pakai</span>
          </div>
        </div>

        <div className="neo-box bg-[#EBF4F6] p-6 min-w-[200px] flex-1 sm:flex-none">
          <p className="text-xs uppercase font-extrabold tracking-wider text-gray-700">Total Sesi Kuis</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black">{loading ? '...' : roomHistory.length}</span>
            <span className="text-xs font-bold text-blue-800">Sesi Kuis Dibuat</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Quiz List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              📂 Daftar Kuis Pancasila
            </h2>
            <a
              href="/mentor/quiz/create"
              className="neo-btn bg-neo-green text-white px-4 py-2 text-xs"
            >
              BUAT KUIS BARU +
            </a>
          </div>

          {loading ? (
            <div className="neo-box bg-white p-8 text-center space-y-3">
              <svg className="animate-spin h-6 w-6 text-neo-blue mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs font-bold text-gray-500">Memuat data kuis dari server...</p>
            </div>
          ) : error ? (
            <div className="neo-box bg-neo-pink/10 p-6 text-center border-neo-pink">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm font-bold text-red-800 mt-2">{error}</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="neo-box bg-white p-8 text-center">
              <span className="text-4xl">📂</span>
              <p className="text-sm font-bold text-gray-500 mt-2">Belum ada kuis yang terdaftar.</p>
              <p className="text-xs text-gray-400 mt-1">Gunakan tombol di atas untuk membuat kuis baru!</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="neo-box bg-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:translate-x-1 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 mb-1.5 flex-wrap">
                      <span className="bg-neo-yellow/20 text-yellow-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-yellow-800 shadow-sm rounded-none">
                        {quiz.category}
                      </span>
                      <span className="bg-neo-pink/20 text-red-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-red-800 shadow-sm rounded-none">
                        {quiz.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-black">{quiz.title}</h3>
                    <p className="text-gray-600 text-xs mt-0.5 font-medium truncate">
                      Total: <strong className="text-black">{quiz.questions} Soal</strong> | {quiz.description || 'Berbasis Standar Kurikulum Merdeka'}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto shrink-0">
                    {/* Only allow editing and deleting on custom quizzes */}
                    {!quiz.isSeeded && (
                      <>
                        <a
                          href={`/mentor/quiz/edit/${quiz.id}`}
                          className="flex-1 sm:flex-none neo-btn bg-white text-black px-3.5 py-3 text-xs font-black"
                          title="Edit Kuis"
                        >
                          ✏️ EDIT
                        </a>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(quiz)}
                          className="flex-1 sm:flex-none neo-btn bg-neo-pink text-white px-3.5 py-3 text-xs font-black"
                          title="Hapus Kuis"
                        >
                          🗑️ HAPUS
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onLaunchLobby(quiz)}
                      className="flex-2 sm:flex-none neo-btn bg-neo-green text-white px-5 py-3 text-sm flex items-center justify-center gap-2"
                    >
                      <span>MULAI ROOM</span>
                      <span>🚀</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Full Width Bottom: Session History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">
          📊 Riwayat Sesi & Aktivitas Siswa
        </h2>

        {loading ? (
          <div className="neo-box bg-white p-8 text-center">
            <p className="text-xs font-bold text-gray-500">Memuat riwayat sesi...</p>
          </div>
        ) : roomHistory.length === 0 ? (
          <div className="neo-box bg-white p-6 text-center">
            <span className="text-3xl">📊</span>
            <p className="text-sm font-bold text-gray-500 mt-2">Belum ada riwayat aktivitas pengerjaan kuis.</p>
            <p className="text-xs text-gray-400 mt-1">Sesi baru akan terdaftar otomatis di sini setelah Anda membuka room kuis.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {roomHistory.map((session) => {
              const isExpanded = !!expandedRooms[session.roomCode];
              const totalFinished = session.students.filter(s => s.is_finished === 1).length;
              
              return (
                <div key={session.roomCode} className="neo-box bg-white overflow-hidden transition-all">
                  {/* Session Summary Card Header */}
                  <div 
                    onClick={() => toggleExpandRoom(session.roomCode)}
                    className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white hover:bg-gray-50 cursor-pointer select-none transition-colors border-b-3 border-transparent"
                    style={{ borderBottomColor: isExpanded ? '#000000' : 'transparent' }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-neo-purple text-white text-xs font-black px-2.5 py-0.5 neo-border shadow-sm">
                          ROOM: {session.roomCode}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 neo-border uppercase ${
                          session.status === 'lobby' ? 'bg-neo-yellow text-black' : 
                          session.status === 'active' ? 'bg-neo-blue text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {session.status === 'lobby' ? 'Lobby' : session.status === 'active' ? 'Sesi Aktif' : 'Selesai / Ditutup'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">{session.quizTitle}</h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase">
                        📅 Dibuat: {formatDate(session.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-xs text-gray-700 font-extrabold uppercase">
                          👥 Partisipan: <strong className="text-black">{session.students.length} Siswa</strong>
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold">
                          🏁 Selesai: {totalFinished} dari {session.students.length}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(session);
                        }}
                        className="neo-btn bg-neo-pink text-white p-2.5 text-xs font-black shadow-sm flex items-center justify-center"
                        title="Hapus Sesi"
                      >
                        🗑️
                      </button>

                      <span className="text-xl font-bold bg-gray-100 p-2 neo-border">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Participant List */}
                  {isExpanded && (
                    <div className="bg-[#FAF6EE] p-5 animate-fadeIn border-t border-black/10">
                      <h4 className="font-extrabold uppercase text-xs text-gray-700 border-b border-black/10 pb-2 mb-3">
                        📋 Daftar Siswa yang Mengerjakan ({session.students.length} Partisipan)
                      </h4>

                      {session.students.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic text-center py-4">
                          Belum ada siswa yang masuk ke room ini.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b-2 border-black text-xs font-black uppercase text-gray-700 bg-white/40">
                                <th className="p-3 w-12 text-center">Avatar</th>
                                <th className="p-3">Nama Siswa</th>
                                <th className="p-3">Skor Akhir</th>
                                <th className="p-3 w-40 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {session.students.map((student, sIdx) => (
                                <tr key={sIdx} className="border-b border-black/10 hover:bg-white/20 text-xs font-bold text-black">
                                  <td className="p-2 text-center">
                                    <img
                                      src={getBackendUrl('/api/media/' + (student.avatar || 'profil-1.webp'))}
                                      alt={student.name}
                                      className="w-8 h-8 rounded-full border-2 border-black mx-auto bg-white shadow-sm"
                                    />
                                  </td>
                                  <td className="p-3 font-extrabold uppercase">{student.name}</td>
                                  <td className="p-3 text-base font-black text-neo-purple">
                                    🏆 {student.score || 0} Poin
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase neo-border shadow-sm ${
                                      student.is_finished === 1 ? 'bg-neo-green/20 text-green-800 border-green-800' : 'bg-neo-pink/20 text-red-800 border-red-800'
                                    }`}>
                                      {student.is_finished === 1 ? 'Selesai' : 'Mengerjakan'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NeoModal for alerts */}
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
  );
}
