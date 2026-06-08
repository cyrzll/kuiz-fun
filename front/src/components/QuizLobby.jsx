import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getBackendUrl } from '../utils/api';

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

export default function QuizLobby({
  role,
  roomCode,
  quizTitle,
  onStartGame,
  onCancel,
  studentName,
  setStudentName,
  students: propStudents
}) {
  const [nameInput, setNameInput] = useState(studentName || '');
  const [isNameSubmitted, setIsNameSubmitted] = useState(!!studentName);
  const [localStudents, setLocalStudents] = useState([]);

  const [joinUrl, setJoinUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/games?code=${roomCode}`);
    }
  }, [roomCode]);

  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const students = role === 'teacher' ? (propStudents || []) : localStudents;

  // Poll for classroom students for the student waiting lobby
  useEffect(() => {
    if (role === 'student' && isNameSubmitted && roomCode) {
      const fetchStudents = async () => {
        try {
          const res = await fetch(getBackendUrl(`/api/rooms/${roomCode}/students`));
          const data = await res.json();
          if (Array.isArray(data)) {
            setLocalStudents(data);
          }
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      };
      
      fetchStudents();
      const interval = setInterval(fetchStudents, 2000);
      return () => clearInterval(interval);
    }
  }, [role, isNameSubmitted, roomCode]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setStudentName(nameInput);
    setIsNameSubmitted(true);
    setLocalStudents((prev) => {
      if (prev.some(s => (s.name || s) === nameInput)) return prev;
      return [...prev, { name: nameInput, avatar: 'profil-1.webp' }];
    });
  };

  // Student joining form
  if (role === 'student' && !isNameSubmitted) {
    return (
      <div className="max-w-md mx-auto neo-box bg-[#FAF6EE] p-5 sm:p-8 rounded-none">
        <div className="mb-6 text-center">
          <span className="bg-neo-blue text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
            Room Code: {roomCode}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2">
            Siapa Namamu? ✏️
          </h2>
          <p className="text-gray-700 text-sm mt-1 font-semibold">
            Tuliskan nama lengkap atau nama panggilanmu agar Guru bisa melihat skormu di papan peringkat.
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 sm:py-3.5 neo-btn bg-neo-pink text-white text-xs"
            >
              KEMBALI ↩️
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 sm:py-3.5 neo-btn bg-neo-yellow text-black text-xs"
            >
              GABUNG LOBBY 🔥
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="neo-box bg-[#EBF4F6] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-black text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block">
            Sesi Kuis Aktif
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            {quizTitle}
          </h1>
          <p className="text-gray-700 text-sm font-semibold mt-1">
            {role === 'teacher'
              ? 'Menunggu siswa bergabung sebelum memulai...'
              : `Halo ${nameInput}, mohon tunggu hingga Guru memulai kuis.`}
          </p>
        </div>

        {/* Room Code & QR Display */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="neo-box bg-neo-yellow px-6 py-4 flex flex-col items-center justify-center min-w-[150px] h-[92px]">
            <p className="text-[10px] uppercase font-black text-black tracking-widest">KODE ROOM SISWA</p>
            <p className="text-4xl font-black tracking-widest text-black mt-1">{roomCode}</p>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="neo-box bg-white p-3 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 border-2 border-black cursor-pointer h-[92px] w-[92px] transition-all hover:-translate-y-0.5 active:translate-y-0"
            title="Tampilkan QR Code"
          >
            {joinUrl ? (
              <QRCodeSVG value={joinUrl} size={50} includeMargin={false} />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-200 animate-pulse" />
            )}
            <span className="text-[8px] font-black uppercase text-black tracking-wider">QR CODE 📱</span>
          </button>
        </div>
      </div>

      {/* Lobby content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
              <span>👥</span> Siswa di Lobby ({students.length})
            </h2>
            <span className="animate-pulse bg-neo-green text-black border border-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
              Mencari Koneksi...
            </span>
          </div>

          {students.length === 0 ? (
            <div className="neo-box bg-white p-12 text-center text-gray-500 font-bold uppercase text-sm border-dashed">
              Belum ada siswa yang masuk...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {students.map((student, idx) => {
                const colorClass = COLORS[idx % COLORS.length];
                const studentNameVal = student.name || student;
                const studentAvatarVal = student.avatar || 'profil-1.webp';
                const isMe = studentNameVal === nameInput || studentNameVal === studentName;
                return (
                  <div
                    key={studentNameVal}
                    className={`neo-box ${colorClass} p-3 flex items-center gap-2.5 font-black uppercase tracking-tight text-xs sm:text-sm relative hover:scale-102 transition-transform animate-fadeIn`}
                  >
                    <img
                      src={getBackendUrl(`/api/media/${studentAvatarVal}`)}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border-2 border-black object-cover bg-white shrink-0"
                    />
                    <span className="truncate">{studentNameVal}</span>
                    {isMe && (
                      <span className="absolute -top-2.5 -left-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider neo-border shadow-sm">
                        SAYA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="neo-box bg-white p-6 space-y-4">
            <h3 className="text-lg font-black uppercase border-b-2 border-black pb-2">
              Status Sesi
            </h3>

            <div className="space-y-3 text-xs font-bold text-gray-700">
              <div className="flex justify-between">
                <span>Peran Anda:</span>
                <span className="bg-black text-white px-2 py-0.5 text-[10px] uppercase font-black">
                  {role === 'teacher' ? 'GURU / MENTOR' : 'SISWA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Metode Join:</span>
                <span className="underline">Kode Kuis 6 Digit</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {role === 'teacher' ? (
                <>
                  <button
                    onClick={onStartGame}
                    disabled={students.length === 0}
                    className="w-full py-4 neo-btn bg-neo-green text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>MULAI PERTANDINGAN</span>
                    <span>🔥</span>
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full py-2.5 neo-btn bg-neo-pink text-white text-xs"
                  >
                    BATALKAN SESI 🛑
                  </button>
                </>
              ) : (
                <div className="text-center p-3 bg-neo-yellow/15 neo-border border-neo-yellow text-xs font-bold text-amber-900 leading-relaxed">
                  ⏳ Menunggu guru menekan tombol <strong>Mulai Pertandingan</strong> untuk memicu kuis di layar Anda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Expansion Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-[#FDFBF7] neo-box p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-neo-pink text-white font-black neo-border text-lg flex items-center justify-center hover:bg-neo-pink/90 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <span className="bg-neo-blue text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm inline-block">
                Pindai Untuk Bergabung 📱
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2">
                QR CODE MASUK ROOM
              </h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                Kuis: {quizTitle}
              </p>
            </div>

            {/* Room Code Showcase */}
            <div className="bg-neo-yellow neo-box p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-black">KODE ROOM SISWA</span>
              <span className="text-4xl font-black tracking-widest text-black mt-1">{roomCode}</span>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center py-2">
              <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {joinUrl ? (
                  <QRCodeSVG value={joinUrl} size={220} includeMargin={false} />
                ) : (
                  <div className="w-[220px] h-[220px] bg-gray-200 animate-pulse" />
                )}
              </div>
            </div>

            {/* Link & Copy Button */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-gray-500 text-left">Link Pendaftaran Siswa:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="flex-1 p-2.5 text-xs font-mono font-bold bg-white neo-input select-all text-black"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 text-xs font-black neo-btn cursor-pointer ${copied ? 'bg-neo-green text-black' : 'bg-neo-blue text-white'}`}
                >
                  {copied ? 'DISALIN! 📋' : 'SALIN LINK 🔗'}
                </button>
              </div>
            </div>

            {/* Localhost Warning */}
            {joinUrl.includes('localhost') && (
              <div className="bg-neo-pink/15 text-red-700 text-[10px] font-extrabold p-3 border-2 border-red-700 uppercase text-left leading-relaxed">
                ⚠️ PERINGATAN KONEKSI LAN: Anda saat ini menggunakan 'localhost'. Siswa di HP tidak akan bisa memindai jika URL QR Code memakai 'localhost'. Buka web ini menggunakan IP LAN Anda (contoh: http://192.168.x.x:4321/auth) agar QR Code bisa dipindai siswa!
              </div>
            )}

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 neo-btn bg-white text-black text-xs font-black cursor-pointer"
            >
              TUTUP MODAL QR ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
