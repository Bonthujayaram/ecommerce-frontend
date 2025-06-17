import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface LoginFormProps {
  onLogin: (userData: { email: string; password: string }) => Promise<any>;
  onResetPassword: (data: { email: string; newPassword: string; confirmPassword: string }) => Promise<any>;
}

export const LoginForm = ({ onLogin, onResetPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onResetPassword={onResetPassword}
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center justify-center gap-2 text-white">
          <h1 className="text-4xl font-extrabold mb-2">Welcome Back</h1>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Sign in to start shopping with your AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-200">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
