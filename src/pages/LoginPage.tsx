import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/config';
import { useNavigate } from 'react-router-dom';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { toast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      login({ 
        id: data.user.id, 
        name: data.user.username, 
        email: data.user.email, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}` 
      });
      
      toast({
        title: "Success!",
        description: "Logged in successfully.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Could not connect to server"
      });
    }
  };

  const handleResetPassword = async ({ email, newPassword, confirmPassword }: { email: string; newPassword: string; confirmPassword: string }) => {
    try {
      const res = await fetch(`${BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, newPassword, confirmPassword })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Password reset failed');
      }

      toast({
        title: "Success!",
        description: "Password has been reset successfully. Please log in with your new password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Could not connect to server"
      });
      throw error;
    }
  };

  const handleSignUp = async ({ username, email, password }: { username: string; email: string; password: string }) => {
    try {
      const res = await fetch(`${BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409) {
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: "A user with this username or email already exists. Please re-enter the details."
          });
          return;
        }
        throw new Error(errorData.error || 'Signup failed');
      }
      
      toast({
        title: "Success!",
        description: "Account created successfully. Please log in.",
      });
      setShowSignUp(false); // After signup, show login form
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Could not connect to server"
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden">
      <BackgroundBeams />
      <div className="w-full max-w-md rounded-xl shadow-2xl bg-neutral-900/80 backdrop-blur-lg p-8 relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-pink-300 shadow-lg">
              <span className="text-white text-2xl font-bold">🛒</span>
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Chatter Commerce</h1>
          <p className="text-neutral-400 text-base font-medium">Your AI Shopping Assistant</p>
        </div>
        {showSignUp ? (
          <>
            <SignUpForm onSignUp={handleSignUp} />
            <div className="text-center mt-4">
              <span className="text-neutral-400">Already have an account? </span>
              <button className="text-white underline font-semibold hover:text-pink-500 transition" onClick={() => setShowSignUp(false)}>Log In</button>
            </div>
          </>
        ) : (
          <>
            <LoginForm onLogin={handleLogin} onResetPassword={handleResetPassword} />
            <div className="text-center mt-4">
              <span className="text-neutral-400">Don't have an account? </span>
              <button className="text-white underline font-semibold hover:text-pink-500 transition" onClick={() => setShowSignUp(true)}>Sign Up</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 