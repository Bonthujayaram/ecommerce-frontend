import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface ForgotPasswordFormProps {
  onResetPassword: (data: { email: string; newPassword: string; confirmPassword: string }) => Promise<any>;
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onResetPassword, onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onResetPassword({ email, newPassword, confirmPassword });
    } catch (error) {
      console.error('Password reset failed:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center justify-center gap-2 text-white">
          <h1 className="text-4xl font-extrabold mb-2">Reset Password</h1>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Enter your email and new password
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
            <Label htmlFor="newPassword" className="text-neutral-200">New Password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-neutral-200">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 w-full"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 border-white/10 text-white hover:bg-white/10"
            >
              Back to Login
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white" 
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 