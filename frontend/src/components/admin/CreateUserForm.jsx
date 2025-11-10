// =====================================================
// frontend/src/components/admin/CreateUserForm.jsx
import { Lock, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Modal from '../common/Modal';

export default function CreateUserForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authApi.register(formData);
      toast.success('User created successfully');
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create user';
      toast.error(message);

      // Set API errors if available
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleInputFocus = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Username Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Username</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              className={`input input-bordered w-full pl-10 pr-4 ${errors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleInputFocus('username')}
              disabled={loading}
            />
          </div>
          {errors.username && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.username}</span>
            </label>
          )}
        </div>

        {/* Email Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              className={`input input-bordered w-full pl-10 pr-4 ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleInputFocus('email')}
              disabled={loading}
            />
          </div>
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
        </div>

        {/* Password Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className={`input input-bordered w-full pl-10 pr-4 ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleInputFocus('password')}
              disabled={loading}
              minLength={8}
            />
          </div>
          <label className="label">
            <span className="label-text-alt text-gray-500">Minimum 8 characters required</span>
          </label>
          {errors.password && (
            <label className="label -mt-2">
              <span className="label-text-alt text-error">{errors.password}</span>
            </label>
          )}
        </div>

        {/* Role Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Role</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
            <select
              name="role"
              className="select select-bordered w-full pl-10 appearance-none"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-base-300">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1 sm:flex-none order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary flex-1 sm:flex-none order-1 sm:order-2 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
