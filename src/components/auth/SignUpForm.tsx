import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface SignUpFormProps {
  onSignUp: (data: { username: string; email: string; password: string }) => Promise<void>;
}

export const SignUpForm = ({ onSignUp }: SignUpFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSignUp({ username, email, password });
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center justify-center gap-2 text-white">
          <h1 className="text-4xl font-extrabold mb-2">Create Account</h1>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Sign up to start shopping with your AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-neutral-200">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20"
            />
          </div>
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
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 