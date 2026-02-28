import { Cpu, Eye, EyeOff, Loader2, Lock, Mail, Radio, Server, User, Wifi, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Attempting login with:', { identifier });

      const result = await login({ identifier, password });
      console.log('📥 Login result:', result);

      if (!result) {
        throw new Error('Login failed - no response from server');
      }

      const user = result.user || result;
      console.log('👤 User data:', user);

      if (!user || !user.role) {
        console.error('❌ Invalid user data received:', user);
        throw new Error('Invalid user data - missing role');
      }

      toast.success(`Bon retour, ${user.name || user.username || 'Utilisateur'} !`);

      // Navigate based on role
      const destination = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination);

    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Identifiants invalides. Veuillez réessayer.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
      }}
    >
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-40 h-40 sm:w-56 sm:h-56 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* ═══════════════════════════════════════════════════════════════════════
            LEFT PANEL — Image & Branding
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="relative lg:w-1/2 h-64 sm:h-80 lg:h-auto min-h-[400px] overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/80 via-cyan-700/70 to-cyan-800/80" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
            {/* Brand Logo */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6 shadow-lg">
              <Radio className="w-8 h-8 text-white" />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="italic">ISET</span>
              <sup className="text-cyan-200 text-lg ml-1">+</sup>
            </h1>
            
            {/* Tagline */}
            <p className="text-white/90 text-sm sm:text-base max-w-xs leading-relaxed">
              La surveillance IoT intelligente qui vous connecte à l'avenir de la technologie
            </p>

            {/* Decorative dots */}
            <div className="flex items-center gap-2 mt-8">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/60" />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            RIGHT PANEL — Login Form
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 relative flex flex-col p-6 sm:p-10 lg:p-12">
          {/* Decorative Signal Icon */}
          <div className="absolute top-6 right-8 text-cyan-500 hidden sm:block">
            <div className="relative">
              <Wifi className="w-6 h-6" />
              {/* Dashed arc decoration */}
              <svg className="absolute -top-2 -right-4 w-16 h-10" viewBox="0 0 60 40">
                <path 
                  d="M 5 35 Q 30 -5 55 25" 
                  fill="none" 
                  stroke="#0891b2" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-cyan-500 mb-2">
              Bienvenue
            </h2>
            <p className="text-gray-400 text-sm">
              Connectez-vous avec votre compte
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto w-full">
            {/* Email/Username Field */}
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusedField === 'identifier' || identifier ? 'text-cyan-500' : 'text-gray-400'
              }`}>
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onFocus={() => setFocusedField('identifier')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                required
                autoComplete="username"
                className={`w-full h-14 pl-12 pr-4 rounded-xl text-base bg-white border-2 text-gray-800 
                          placeholder:text-transparent peer
                          focus:outline-none transition-all duration-200 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${focusedField === 'identifier' || identifier 
                            ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                placeholder="Email ou nom d'utilisateur"
              />
              <label
                htmlFor="identifier"
                className={`absolute left-12 transition-all duration-200 pointer-events-none
                          ${focusedField === 'identifier' || identifier
                            ? '-top-2.5 left-3 text-xs bg-white px-2 text-cyan-500 font-medium'
                            : 'top-1/2 -translate-y-1/2 text-gray-400 text-base'
                          }`}
              >
                Email ou Identifiant
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusedField === 'password' || password ? 'text-cyan-500' : 'text-gray-400'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                required
                autoComplete="current-password"
                className={`w-full h-14 pl-12 pr-12 rounded-xl text-base bg-white border-2 text-gray-800 
                          placeholder:text-transparent peer
                          focus:outline-none transition-all duration-200 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${focusedField === 'password' || password 
                            ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                placeholder="Mot de passe"
              />
              <label
                htmlFor="password"
                className={`absolute left-12 transition-all duration-200 pointer-events-none
                          ${focusedField === 'password' || password
                            ? '-top-2.5 left-3 text-xs bg-white px-2 text-cyan-500 font-medium'
                            : 'top-1/2 -translate-y-1/2 text-gray-400 text-base'
                          }`}
              >
                Mot de passe
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors duration-200 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="text-sm text-gray-400 hover:text-cyan-500 transition-colors duration-200">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full h-12 rounded-xl text-base font-semibold text-white
                       bg-gradient-to-r from-cyan-500 to-cyan-600
                       hover:from-cyan-400 hover:to-cyan-500 
                       focus:outline-none focus:ring-4 focus:ring-cyan-500/30
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-cyan-600
                       transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                       shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40
                       uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </span>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-auto pt-8 text-center">
            <p className="text-sm text-gray-400">
              Propulsé par <span className="font-medium text-gray-600">SupNum</span> & <span className="font-medium text-gray-600">ISET</span>
            </p>
          </div>

          {/* Decorative Skyline */}
          <div className="absolute bottom-0 right-0 left-1/3 h-20 overflow-hidden pointer-events-none opacity-60">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="xMaxYMax slice">
              {/* IoT Buildings/Towers Silhouette */}
              <g fill="#0891b2" opacity="0.15">
                {/* Server/Data center */}
                <rect x="20" y="30" width="35" height="50" rx="2" />
                <rect x="25" y="35" width="8" height="4" fill="#0891b2" opacity="0.5" />
                <rect x="25" y="42" width="8" height="4" fill="#0891b2" opacity="0.5" />
                <rect x="25" y="49" width="8" height="4" fill="#0891b2" opacity="0.5" />
                <rect x="38" y="35" width="8" height="4" fill="#0891b2" opacity="0.5" />
                <rect x="38" y="42" width="8" height="4" fill="#0891b2" opacity="0.5" />
                <rect x="38" y="49" width="8" height="4" fill="#0891b2" opacity="0.5" />
                
                {/* Communication Tower */}
                <polygon points="80,80 95,20 110,80" />
                <rect x="90" y="15" width="10" height="8" rx="1" />
                <line x1="95" y1="5" x2="95" y2="15" stroke="#0891b2" strokeWidth="2" />
                <circle cx="95" cy="5" r="3" />
                
                {/* Office Building */}
                <rect x="130" y="25" width="45" height="55" rx="2" />
                <rect x="135" y="30" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="147" y="30" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="159" y="30" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="135" y="45" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="147" y="45" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="159" y="45" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="135" y="60" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="147" y="60" width="8" height="10" fill="white" opacity="0.5" />
                <rect x="159" y="60" width="8" height="10" fill="white" opacity="0.5" />
                
                {/* Satellite Dish */}
                <ellipse cx="210" cy="60" rx="20" ry="8" />
                <line x1="210" y1="60" x2="210" y2="80" stroke="#0891b2" strokeWidth="4" />
                <path d="M195 55 Q210 40 225 55" fill="none" stroke="#0891b2" strokeWidth="3" />
                
                {/* Smart Factory */}
                <rect x="250" y="40" width="50" height="40" rx="2" />
                <rect x="270" y="25" width="15" height="15" rx="1" />
                <circle cx="277" cy="32" r="4" fill="white" opacity="0.4" />
                <rect x="310" y="50" width="8" height="30" />
                <ellipse cx="314" cy="45" rx="6" ry="8" />
                
                {/* Wind Turbine */}
                <line x1="350" y1="80" x2="350" y2="35" stroke="#0891b2" strokeWidth="4" />
                <circle cx="350" cy="35" r="5" />
                <line x1="350" y1="35" x2="350" y2="10" stroke="#0891b2" strokeWidth="2" />
                <line x1="350" y1="35" x2="330" y2="50" stroke="#0891b2" strokeWidth="2" />
                <line x1="350" y1="35" x2="370" y2="50" stroke="#0891b2" strokeWidth="2" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
