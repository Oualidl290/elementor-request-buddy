
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { Sparkles, Shield, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  // Generate a unique project ID for new designers
  const generateProjectId = () => {
    return 'proj_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to designer panel
        if (session?.user) {
          navigate('/designer-panel');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/designer-panel');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      const projectId = generateProjectId();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: 'designer',
            project_id: projectId
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setError(`🎉 Welcome! Your project ID is: ${projectId}. Please save this! Check your email for a confirmation link.`);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Navigation will be handled by the auth state change listener
        console.log('Sign in successful');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home button */}
        <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl mb-6 shadow-xl shadow-emerald-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
            {isLogin ? 'Welcome back' : 'Join Request Manager'}
          </h1>
          <p className="text-slate-600 text-lg">
            {isLogin 
              ? 'Sign in to your designer workspace' 
              : 'Create your account and start managing client feedback like a pro'
            }
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:ring-4 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                  className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:ring-4 transition-all duration-200"
                />
              </div>

              {!isLogin && (
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 mb-1">
                        Designer Account Benefits
                      </p>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Get a unique project ID to share with clients. Manage all feedback and requests in one centralized, beautiful dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className={`text-sm p-4 rounded-2xl border ${
                  error.includes('project ID is:') || error.includes('Check your email') || error.includes('🎉') || error.includes('✅')
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isLogin ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                {isLogin ? "Don't have an account? Create designer account" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Lightning Fast</p>
          </div>
          <div className="p-3">
            <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Secure & Private</p>
          </div>
          <div className="p-3">
            <Sparkles className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">AI-Powered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
