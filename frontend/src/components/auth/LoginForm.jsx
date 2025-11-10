// frontend/src/components/auth/LoginForm.jsx
import { useAuth } from "../../contexts/AuthContext";

import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      setLoading(true);
      console.log('📤 Attempting login with:', { identifier });

      const result = await login({ identifier, password });

      console.log('📥 Login result:', result);

      // Check if result has user data
      if (!result) {
        throw new Error('Login failed - no response from server');
      }

      // Handle if result is the user object directly or wrapped in result.user
      const user = result.user || result;

      console.log('👤 User data:', user);

      if (!user || !user.role) {
        console.error('❌ Invalid user data received:', user);
        throw new Error('Invalid user data - missing role');
      }

      toast.success(`Welcome back, ${user.name || user.username || 'User'}!`);

      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Invalid credentials. Please try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#123] items-center justify-center  p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body  bg-white p-6 rounded-lg">
          <h2 className=" text-black card-title text-3xl font-bold text-center justify-center mb-6">
            Iset-Project
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8  text-black" >
            <div className="form-control  bg-white p-5 ">
              <label className="label  text-black">
                <span className="label-text  text-black">Username</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5  text-black" />
                <input
                  type="text"
                  placeholder="Enter username"
                  className="input input-bordered w-full pl-10 bg-white"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="labe  text-blackl">
                <span className="label-text   text-black">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-black" />
                <input
                  type="password"
                  placeholder="Enter password"
                  className="input input-bordered w-full  pl-20  bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* <div className="divider">Demo Credentials</div>
          <div className="text-center text-sm space-y-1">
            <p className="text-gray-600">
              <span className="font-semibold">Admin:</span> admin / admin123
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">User:</span> user1 / password123
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
