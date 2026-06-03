import React, { useState } from 'react';

export default function AuthCard({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (activeTab === 'register') {
      if (!formData.name.trim()) tempErrors.name = 'Nama lengkap wajib diisi!';
      if (!formData.schoolName.trim()) tempErrors.schoolName = 'Nama Sekolah/Instansi wajib diisi!';
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Konfirmasi password tidak cocok!';
      }
      if (!formData.agreeToTerms) {
        tempErrors.agreeToTerms = 'Anda harus menyetujui syarat & ketentuan!';
      }
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email wajib diisi!';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Format email tidak valid!';
    }
    if (!formData.password) {
      tempErrors.password = 'Password wajib diisi!';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password minimal terdiri dari 6 karakter!';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Mock authentication lag
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess({
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        schoolName: formData.schoolName || 'SD Pancasila Merdeka'
      });
    }, 1000);
  };

  return (
    <div className="neo-box bg-white rounded-none relative overflow-hidden">
      {/* Tape decoration for neobrutalism look */}
      <div className="absolute -top-3 -right-12 bg-neo-yellow text-black font-extrabold py-1 px-12 rotate-12 neo-border text-xs uppercase tracking-wider shadow-sm">
        Mentor / Guru
      </div>

      {/* Tabs */}
      <div className="flex neo-border-b bg-gray-50">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setErrors({});
          }}
          className={`flex-1 py-3 sm:py-4 font-black uppercase text-sm tracking-wider border-r-[3px] border-black transition-all ${
            activeTab === 'login'
              ? 'bg-neo-yellow text-black'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          🔑 Masuk
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setErrors({});
          }}
          className={`flex-1 py-3 sm:py-4 font-black uppercase text-sm tracking-wider transition-all ${
            activeTab === 'register'
              ? 'bg-neo-yellow text-black'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          📝 Daftar
        </button>
      </div>

      <div className="p-5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {activeTab === 'login' ? 'Selamat Datang Kembali!' : 'Gabung Sebagai Mentor'}
          </h2>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            {activeTab === 'login'
              ? 'Kelola ruang kelas, buat kuis, dan pantau hasil belajar siswa Anda secara real-time.'
              : 'Dapatkan akses penuh ke generator kuis Pancasila, pembuat room, dan analitik siswa.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Budi Setiawan, S.Pd."
                  className="w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base"
                  disabled={loading}
                />
                {errors.name && <p className="text-xs text-red-600 font-bold">{errors.name}</p>}
              </div>

              {/* School Name */}
              <div className="space-y-1">
                <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
                  Sekolah / Instansi
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="SD Negeri 1 Merdeka"
                  className="w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base"
                  disabled={loading}
                />
                {errors.schoolName && <p className="text-xs text-red-600 font-bold">{errors.schoolName}</p>}
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="budi@sekolah.sch.id"
              className="w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base"
              disabled={loading}
            />
            {errors.email && <p className="text-xs text-red-600 font-bold">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full p-2.5 sm:p-3 rounded-none neo-input bg-white focus:bg-amber-50/50 text-base"
              disabled={loading}
            />
            {errors.password && <p className="text-xs text-red-600 font-bold">{errors.password}</p>}
          </div>

          {activeTab === 'register' && (
            <>
              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs uppercase font-extrabold tracking-wider text-black">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full p-2.5 sm:p-3 rounded-none neo-input bg-white text-base"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 font-bold">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Agree checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-neo-yellow neo-border cursor-pointer shrink-0"
                  disabled={loading}
                />
                <label htmlFor="agreeToTerms" className="text-xs font-bold text-gray-700 select-none cursor-pointer leading-tight">
                  Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi Pancasila Fun Quiz.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-red-600 font-bold">{errors.agreeToTerms}</p>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 sm:py-4 neo-btn bg-neo-yellow text-black hover:bg-neo-yellow/95 transition-all text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <span>{activeTab === 'login' ? 'MASUK KE DASHBOARD' : 'BUAT AKUN BARU'}</span>
                <span>🔥</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
