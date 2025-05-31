import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, LogIn, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthProps {
  onAuthChange: (session: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        onAuthChange(session);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthChange(session);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthChange]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email
      });

      if (error) throw error;
      toast.success('Check your email for the magic link!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
      console.error('Magic link error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            DEICER App  IOS / Android
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email and we'll send a magic link
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleMagicLink}>
          <div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-800 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-gray-700 focus:border-gray-700 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-800 text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="-ml-1 mr-2 h-5 w-5" />
                  Send Magic Link
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;