import React, { useState, useEffect } from 'react';
import NeoModal from './NeoModal';
import { getBackendUrl } from '../utils/api';

const AVAILABLE_ICONS = ['📖', '💡', '🇮🇩', '🤝', '🏛️', '🌟', '🛡️', '🎯', '✊', '📝'];

export default function QuizEditApp({ moduleId }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modal notification state
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', icon: '⚠️', onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));

  // Steps state: 1: Info, 2: Modul/Materi, 3: Soal/Quiz
  const [step, setStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // Auth check & load quiz details
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
          return;
        }
      } else {
        window.location.href = '/auth';
        return;
      }
      setLoadingUser(false);

      // Fetch dynamic quiz details
      const fetchQuizDetails = async () => {
        try {
          const res = await fetch(getBackendUrl(`/api/modules/${moduleId}`));
          if (!res.ok) {
            throw new Error('Gagal memuat kuis dari database. Kuis mungkin sudah dihapus atau tidak ditemukan.');
          }
          const data = await res.json();
          setTitle(data.title);
          setDescription(data.description || '');
          setMaterials(data.materials || []);
          
          // Map backend questions format to state (options keys A-D)
          const mappedQuestions = (data.questions || []).map(q => ({
            question: q.question,
            explanation: q.explanation || '',
            options: (q.options || []).map(opt => ({
              key: opt.key,
              text: opt.text,
              isCorrect: opt.isCorrect
            }))
          }));
          setQuestions(mappedQuestions);
        } catch (err) {
          console.error(err);
          setErrorMsg(err.message);
        } finally {
          setLoadingQuiz(false);
        }
      };

      fetchQuizDetails();
    }
  }, [moduleId]);

  // Slide Materials Handlers
  const handleAddMaterial = () => {
    setMaterials([...materials, { title: '', content: '', icon: '📖' }]);
  };

  const handleRemoveMaterial = (index) => {
    if (materials.length <= 1) {
      showModal({
        title: 'Gagal Menghapus',
        message: 'Kuis harus memiliki minimal 1 slide materi edukasi.',
        type: 'warning',
        icon: '⚠️'
      });
      return;
    }
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
  };

  const handleUpdateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  // Questions Handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        explanation: '',
        options: [
          { key: 'A', text: '', isCorrect: true },
          { key: 'B', text: '', isCorrect: false },
          { key: 'C', text: '', isCorrect: false },
          { key: 'D', text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      showModal({
        title: 'Gagal Menghapus',
        message: 'Kuis harus memiliki minimal 1 pertanyaan.',
        type: 'warning',
        icon: '⚠️'
      });
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleUpdateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleUpdateExplanation = (index, value) => {
    const updated = [...questions];
    updated[index].explanation = value;
    setQuestions(updated);
  };

  const handleUpdateOptionText = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIndex, correctKey) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map(opt => ({
      ...opt,
      isCorrect: opt.key === correctKey
    }));
    setQuestions(updated);
  };

  // Navigation Validations
  const validateStep1 = () => {
    if (!title.trim()) {
      showModal({
        title: 'Input Tidak Lengkap',
        message: 'Silakan isi Judul Kuis terlebih dahulu.',
        type: 'warning',
        icon: '📝'
      });
      return false;
    }
    if (!description.trim()) {
      showModal({
        title: 'Input Tidak Lengkap',
        message: 'Silakan isi Deskripsi Kuis terlebih dahulu.',
        type: 'warning',
        icon: '📝'
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < materials.length; i++) {
      if (!materials[i].title.trim() || !materials[i].content.trim()) {
        showModal({
          title: 'Slide Belum Lengkap',
          message: `Silakan lengkapi judul dan konten untuk Slide ke-${i + 1}.`,
          type: 'warning',
          icon: '📖'
        });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        showModal({
          title: 'Soal Belum Lengkap',
          message: `Pertanyaan pada Soal ke-${i + 1} masih kosong.`,
          type: 'warning',
          icon: '❓'
        });
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          showModal({
            title: 'Pilihan Jawaban Kosong',
            message: `Pilihan ${q.options[j].key} pada Soal ke-${i + 1} harus diisi.`,
            type: 'warning',
            icon: '✏️'
          });
          return false;
        }
      }
      const hasCorrect = q.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        showModal({
          title: 'Jawaban Benar Belum Dipilih',
          message: `Silakan pilih salah satu jawaban benar untuk Soal ke-${i + 1}.`,
          type: 'warning',
          icon: '✅'
        });
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Submit to Backend
  const handleSubmitQuiz = async () => {
    if (!validateStep3()) return;

    setSubmitting(true);

    try {
      const res = await fetch(getBackendUrl(`/api/modules/${moduleId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          materials,
          questions
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal menyimpan pembaruan kuis');
      }

      showModal({
        title: 'Perubahan Kuis Disimpan!',
        message: `Kuis "${title}" telah berhasil diperbarui di database. Sesi kuis baru akan menggunakan perubahan ini.`,
        type: 'success',
        icon: '🎉',
        onConfirm: () => {
          window.location.href = '/mentor';
        }
      });
    } catch (err) {
      console.error(err);
      showModal({
        title: 'Penyimpanan Gagal',
        message: 'Gagal menghubungi server untuk memperbarui kuis: ' + err.message,
        type: 'error',
        icon: '❌'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser || loadingQuiz) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full neo-box bg-white p-8 text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-neo-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-bold text-gray-700 font-poppins">
            {errorMsg ? 'Terjadi kesalahan...' : 'Memuat data kuis...'}
          </p>
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border-2 border-red-300 font-semibold text-xs mt-2">
              {errorMsg}
            </div>
          )}
          {errorMsg && (
            <a href="/mentor" className="neo-btn bg-white px-4 py-2 text-xs font-bold uppercase mt-4 block">
              Kembali ke Dashboard
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl bg-neo-purple p-1.5 neo-border shadow-sm text-white">✏️</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                EDIT <span className="bg-neo-purple text-white px-1.5 neo-border shadow-sm border-black">MODUL & KUIS</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Ubah Materi Edukasi dan Kuis yang Sudah Ada
              </p>
            </div>
          </div>
          <a
            href="/mentor"
            className="neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100"
          >
            <span>BATAL / DASHBOARD</span>
            <span>📂</span>
          </a>
        </header>

        {/* Step Progress Tracker */}
        <div className="neo-box bg-white p-5">
          <div className="relative flex justify-between items-center max-w-md mx-auto">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-black z-0" />
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 neo-border font-black flex items-center justify-center text-sm shadow-sm transition-colors ${step >= 1 ? 'bg-neo-yellow text-black' : 'bg-white text-gray-400'}`}>
                1
              </div>
              <span className="text-[10px] font-black uppercase mt-1 bg-white px-1 border border-black mt-1.5">Judul</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 neo-border font-black flex items-center justify-center text-sm shadow-sm transition-colors ${step >= 2 ? 'bg-neo-pink text-white' : 'bg-white text-gray-400'}`}>
                2
              </div>
              <span className="text-[10px] font-black uppercase mt-1 bg-white px-1 border border-black mt-1.5">Materi</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 neo-border font-black flex items-center justify-center text-sm shadow-sm transition-colors ${step >= 3 ? 'bg-neo-green text-black' : 'bg-white text-gray-400'}`}>
                3
              </div>
              <span className="text-[10px] font-black uppercase mt-1 bg-white px-1 border border-black mt-1.5">Soal</span>
            </div>
          </div>
        </div>

        {/* Wizard Forms */}
        <div className="neo-box bg-white p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b-3 border-black pb-3">
                <h2 className="text-xl font-black uppercase flex items-center gap-2">
                  <span>📝</span> Langkah 1: Informasi Kuis Utama
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                  Masukkan judul dan deskripsi ringkas materi kuis Anda.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase font-extrabold text-black">
                  Judul Kuis / Topik Pembelajaran <span className="text-neo-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengamalan Sila Keadilan Sosial"
                  className="w-full p-3.5 rounded-none neo-input bg-white text-sm sm:text-base font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase font-extrabold text-black">
                  Deskripsi / Rangkuman Singkat <span className="text-neo-pink">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan secara ringkas materi apa yang dibahas dalam modul kuis ini agar siswa mendapat gambaran..."
                  className="w-full p-3.5 rounded-none neo-input bg-white text-sm sm:text-base font-semibold resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b-3 border-black pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-black uppercase flex items-center gap-2">
                    <span>📖</span> Langkah 2: Slide Modul Materi
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                    Buat slide materi yang wajib dibaca siswa sebelum kuis dimulai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="neo-btn bg-neo-pink text-white px-3.5 py-2 text-xs self-stretch sm:self-auto"
                >
                  TAMBAH SLIDE +
                </button>
              </div>

              <div className="space-y-6">
                {materials.map((mat, mIdx) => (
                  <div key={mIdx} className="neo-box bg-[#FAF6EE] p-5 space-y-4 relative">
                    <div className="flex justify-between items-center border-b-2 border-black pb-2">
                      <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                        Slide {mIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mIdx)}
                        className="text-xs font-black text-red-600 hover:underline flex items-center gap-1 uppercase"
                      >
                        Hapus Slide ❌
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Emoji Selector */}
                      <div className="md:col-span-1 space-y-1">
                        <label className="block text-[10px] uppercase font-extrabold text-black">
                          Pilih Ikon Emoji
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 p-2 bg-white neo-border max-w-[180px] md:max-w-none">
                          {AVAILABLE_ICONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleUpdateMaterial(mIdx, 'icon', emoji)}
                              className={`w-7 h-7 flex items-center justify-center text-md border hover:bg-gray-100 ${mat.icon === emoji ? 'border-2 border-black bg-neo-yellow' : 'border-gray-200'}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title and Content */}
                      <div className="md:col-span-3 space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-extrabold text-black">
                            Judul Slide Materi <span className="text-neo-pink">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={mat.title}
                            onChange={(e) => handleUpdateMaterial(mIdx, 'title', e.target.value)}
                            placeholder="Contoh: Makna Lambang Rantai Emas"
                            className="w-full p-2.5 rounded-none neo-input bg-white text-xs sm:text-sm font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-extrabold text-black">
                            Isi Penjelasan Materi <span className="text-neo-pink">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={mat.content}
                            onChange={(e) => handleUpdateMaterial(mIdx, 'content', e.target.value)}
                            placeholder="Tuliskan penjelasan materi secara ringkas dan mudah dipahami siswa..."
                            className="w-full p-2.5 rounded-none neo-input bg-white text-xs sm:text-sm font-medium resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="w-full py-3 neo-btn bg-white text-black text-xs font-black border-dashed hover:bg-gray-50"
                >
                  + TAMBAH SLIDE MATERI BARU
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b-3 border-black pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-black uppercase flex items-center gap-2">
                    <span>❓</span> Langkah 3: Soal & Pilihan Jawaban
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                    Buat pertanyaan kuis beserta 4 pilihan opsi (A-D) dan pembahasannya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="neo-btn bg-neo-pink text-white px-3.5 py-2 text-xs self-stretch sm:self-auto"
                >
                  TAMBAH SOAL +
                </button>
              </div>

              <div className="space-y-8">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="neo-box bg-[#FAF6EE] p-5 space-y-4 relative">
                    <div className="flex justify-between items-center border-b-2 border-black pb-2">
                      <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                        Pertanyaan {qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs font-black text-red-600 hover:underline flex items-center gap-1 uppercase"
                      >
                        Hapus Soal ❌
                      </button>
                    </div>

                    {/* Question text */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-extrabold text-black">
                        Pertanyaan Kuis <span className="text-neo-pink">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                        placeholder="Contoh: Mengapa gotong royong merupakan ciri khas bangsa Indonesia?"
                        className="w-full p-2.5 rounded-none neo-input bg-white text-xs sm:text-sm font-semibold resize-none"
                      />
                    </div>

                    {/* Options (A-D) */}
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase font-extrabold text-black border-b border-black/10 pb-1">
                        Pilihan Jawaban (Isi teks & pilih satu tombol hijau untuk menetapkan jawaban yang benar) <span className="text-neo-pink">*</span>
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.key} className="flex gap-2 items-center">
                            <button
                              type="button"
                              onClick={() => handleSetCorrectOption(qIdx, opt.key)}
                              className={`w-10 h-10 neo-border font-black text-xs flex items-center justify-center shrink-0 ${opt.isCorrect ? 'bg-neo-green text-black' : 'bg-white text-gray-500'}`}
                              title={opt.isCorrect ? 'Jawaban Benar' : 'Jadikan Jawaban Benar'}
                            >
                              {opt.key}
                            </button>
                            <input
                              type="text"
                              required
                              value={opt.text}
                              onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                              placeholder={`Opsi ${opt.key}`}
                              className="w-full p-2 rounded-none neo-input bg-white text-xs font-semibold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-extrabold text-black">
                        Penjelasan / Pembahasan Soal
                      </label>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                        placeholder="Contoh: Gotong royong mencerminkan kepribadian bangsa Indonesia yang mengutamakan kebersamaan dan kekeluargaan..."
                        className="w-full p-2.5 rounded-none neo-input bg-white text-xs font-medium resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-3 neo-btn bg-white text-black text-xs font-black border-dashed hover:bg-gray-50"
                >
                  + TAMBAH SOAL KUIS BARU
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center gap-4 bg-white neo-box p-4">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`px-5 py-3 text-xs sm:text-sm font-black neo-btn bg-white text-black ${step === 1 ? 'opacity-30 cursor-not-allowed transform-none shadow-sm' : ''}`}
          >
            ⬅️ KEMBALI
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 text-xs sm:text-sm font-black neo-btn bg-neo-yellow text-black"
            >
              LANJUTKAN ➡️
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-6 py-3 text-xs sm:text-sm font-black neo-btn bg-neo-green text-white flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <span>SIMPAN PERUBAHAN 🚀</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* NeoModal Alerts */}
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
