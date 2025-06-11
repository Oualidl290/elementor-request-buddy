
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create your Designer account'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to your designer account' 
              : 'Start creating projects and managing client feedback'
            }
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                  className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              {!isLogin && (
                <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-violet-100 rounded-lg">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">
                        Designer Account Benefits
                      </p>
                      <p className="text-xs text-violet-700 mt-1">
                        Get a unique project ID to share with clients. Manage all feedback and requests in one place.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className={`text-sm p-4 rounded-xl ${
                  error.includes('project ID is:') || error.includes('Check your email') || error.includes('🎉') || error.includes('✅')
                    ? 'text-green-700 bg-green-50 border border-green-100' 
                    : 'text-red-700 bg-red-50 border border-red-100'
                }`}>
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Designer Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline transition-colors"
              >
                {isLogin ? "Don't have an account? Create designer account" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
