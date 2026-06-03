import React, { useState, useRef, useEffect } from 'react';

export default function RoomJoin({ onJoinRoom }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // Clear focus and elements on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index, val) => {
    // Only allow numbers
    if (val !== '' && !/^[0-9]$/.test(val)) return;

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (val !== '' && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous on backspace if current is empty
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputsRef.current[index - 1].focus();
      } else {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      setError('Kode harus berupa 6 digit angka!');
      return;
    }

    const digits = pastedData.split('');
    setCode(digits);
    setError('');
    inputsRef.current[5].focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length < 6) {
      setError('Masukkan 6 digit kode room secara lengkap!');
      return;
    }

    setLoading(true);
    // Mock network lag
    setTimeout(() => {
      setLoading(false);
      onJoinRoom(finalCode);
    }, 800);
  };

  return (
    <div className="neo-box bg-[#EBF4F6] p-5 sm:p-8 rounded-none relative overflow-hidden">
      {/* Tape decoration for neobrutalism look */}
      <div className="absolute -top-3 -right-12 bg-neo-pink text-white font-bold py-1 px-12 rotate-12 neo-border text-xs uppercase tracking-wider shadow-sm">
        Siswa
      </div>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
          <span>🎮</span>
          <span>Masuk Kuis (Siswa)</span>
        </h2>
        <p className="text-gray-700 text-sm mt-2 font-medium">
          Punya kode room dari Guru/Mentor? Masukkan 6 digit kodenya di bawah untuk bergabung ke arena belajar seru!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs uppercase font-extrabold tracking-widest text-black">
            Kode Room 6-Digit
          </label>
          <div className="flex justify-between gap-1.5 sm:gap-3" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-9 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-none neo-input bg-white focus:bg-neo-yellow transition-all"
                placeholder="-"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="neo-box bg-neo-pink/20 text-red-700 p-3 text-xs font-bold neo-border border-red-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-4 neo-btn bg-neo-blue text-white hover:bg-neo-blue/95 transition-all text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Memvalidasi...</span>
            </>
          ) : (
            <>
              <span>MASUK ROOM SEKARANG</span>
              <span>⚡</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
