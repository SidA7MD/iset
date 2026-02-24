// frontend/src/components/admin/CreateUserForm.jsx
// ══════════════════════════════════════════════════════════════════════════════
// CREATE USER FORM - Enterprise-grade user creation modal
// ══════════════════════════════════════════════════════════════════════════════
// Design System:
// - Visual role selection cards instead of dropdown
// - Password strength indicator with real-time feedback
// - Clean form layout with consistent spacing (4px grid)
// - Accessible with proper ARIA labels and focus management
// ══════════════════════════════════════════════════════════════════════════════

import { Check, Eye, EyeOff, Lock, Mail, Shield, User, UserPlus } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Modal from '../common/Modal';

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Très faible', color: 'bg-red-500' },
    { score: 2, label: 'Faible', color: 'bg-orange-500' },
    { score: 3, label: 'Moyen', color: 'bg-yellow-500' },
    { score: 4, label: 'Fort', color: 'bg-emerald-500' },
    { score: 5, label: 'Très fort', color: 'bg-emerald-600' },
  ];

  return levels[Math.min(score, 5)];
};

// Role configuration
const ROLES = [
  {
    value: 'user',
    label: 'Utilisateur',
    description: 'Accès standard aux appareils assignés',
    icon: User,
  },
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à la gestion',
    icon: Shield,
  },
];

export default function CreateUserForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(formData.password),
    [formData.password]
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 caractères requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await authApi.register(formData);
      toast.success('Utilisateur créé avec succès');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Échec de la création';
      toast.error(message);
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setRole = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="md" showCloseButton={false}>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 
                        flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-base-content">Créer un utilisateur</h2>
          <p className="text-sm text-base-content/50">Ajouter un nouveau compte au système</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Username Field ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Nom d'utilisateur
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <User className="w-[18px] h-[18px]" />
            </div>
            <input
              type="text"
              name="username"
              placeholder="ex: jean.dupont"
              className={`form-input ${errors.username ? 'form-input--error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          {errors.username && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              {errors.username}
            </p>
          )}
        </div>

        {/* ── Email Field ──────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <Mail className="w-[18px] h-[18px]" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="ex: jean.dupont@email.com"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* ── Password Field ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
              <Lock className="w-[18px] h-[18px]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Minimum 8 caractères"
              className={`form-input pr-10 ${errors.password ? 'form-input--error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 
                         hover:text-base-content/60 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength.score
                        ? passwordStrength.color
                        : 'bg-base-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-base-content/50">
                Force: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* ── Role Selection ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Rôle utilisateur
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = formData.role === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setRole(role.value)}
                  disabled={loading}
                  className={`role-card ${isSelected ? 'role-card--selected' : ''}`}
                >
                  <div className={`role-card-icon ${isSelected ? 'role-card-icon--selected' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-cyan-600' : 'text-base-content'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-4 border-t border-base-300">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Création...
              </span>
            ) : (
              'Créer l\'utilisateur'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
