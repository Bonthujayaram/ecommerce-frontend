import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';
import { Timer, Check, AlertCircle, Home, Plus, X, CreditCard, QrCode, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/config';

const PAYMENT_TIMEOUT = 120; // 2 minutes in seconds

export const Checkout = () => {
  const { cart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'HOME',
    name: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'QR'>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAddresses = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingError(null);
      const response = await fetch(`${BASE_URL}/users/${user.id}/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      const data = await response.json();
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setLoadingError('Failed to load saved addresses. Please check your connection and try again.');
      toast({
        title: "Error",
        description: "Failed to load saved addresses. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Timer effect for payment
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending' && showQR) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('failed');
    }
  }, [timeLeft, paymentStatus, showQR]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddressSubmit = () => {
    if (!selectedAddress) {
      toast({
        title: "Select Address",
        description: "Please select an address or add a new one to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep('payment');
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please login to add an address",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/${user.id}/addresses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(addressForm)
      });

      if (!response.ok) {
        throw new Error('Failed to add address');
      }

      const newAddress = await response.json();
      setAddresses(prevAddresses => [...prevAddresses, newAddress]);
      setSelectedAddress(newAddress.id.toString());
      setShowAddressModal(false);
      setAddressForm({ label: 'HOME', name: '', phone: '', address: '' });
      
      toast({
        title: "Address Added",
        description: "New address has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'UPI' && (!upiId || !upiId.includes('@'))) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g., username@upi)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the selected address data
      const selectedAddressData = addresses.find(a => a.id.toString() === selectedAddress);
      
      if (!selectedAddressData) {
        throw new Error('Selected address not found');
      }

      // Validate cart items
      if (!cart || cart.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate user
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // Create order data
      const orderData = {
        user_id: user.id,
        total_amount: Number(cartTotal),
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'UPI' 
          ? JSON.stringify({ upiId }) 
          : JSON.stringify({ method: 'QR' }),
        status: 'PAID', // Auto-mark as paid
        address_id: Number(selectedAddressData.id),
        order_items: cart.map(item => ({
          product_id: Number(item.product.id),
          quantity: Number(item.quantity),
          price: Number(item.product.price)
        }))
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      // Create the order
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        // Log detailed error information
        console.error('Order creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || data.details || data.message || 'Failed to create order');
      }

      // Order created successfully
      setPaymentStatus('success');
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase. Your order has been confirmed.",
      });
      clearCart();
      
      // Navigate to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-red-500">Connection Error</h2>
        <p className="text-center text-gray-600">{loadingError}</p>
        <Button 
          onClick={fetchAddresses}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
            <p className="text-gray-300">Complete your order</p>
          </div>

          {step === 'address' ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Delivery Address</h2>
              
              <RadioGroup 
                value={selectedAddress?.toString()} 
                onValueChange={(value) => setSelectedAddress(value === 'new' ? 'new' : value)}
                className="space-y-4"
              >
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start space-x-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                    <RadioGroupItem value={addr.id.toString()} id={`address-${addr.id}`} className="mt-1" />
                    <Label htmlFor={`address-${addr.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4" />
                        <span className="font-semibold text-white uppercase">{addr.label}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{addr.name}</p>
                      <p className="text-gray-400 text-sm">{addr.address}</p>
                      <p className="text-gray-400 text-sm">Phone: {addr.phone}</p>
                    </Label>
                  </div>
                ))}
                
                <div 
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                  onClick={() => setShowAddressModal(true)}
                >
                  <RadioGroupItem value="new" id="address-new" className="mt-0" />
                  <Label htmlFor="address-new" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="font-semibold text-white">Add New Address</span>
                  </Label>
                </div>
              </RadioGroup>

              <Button 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-400 text-white font-medium hover:opacity-90 mt-6"
                onClick={handleAddressSubmit}
                disabled={!selectedAddress}
              >
                Continue to Payment
              </Button>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center text-gray-300 border-b border-gray-800 pb-4">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="pt-4">
                      <div className="flex justify-between items-center text-xl font-bold text-white">
                        <span>Total</span>
                        <span>₹{(cartTotal || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Delivery Address</h3>
                  {selectedAddress && selectedAddress !== 'new' && (
                    <div className="text-gray-300 text-sm">
                      {(() => {
                        const addr = addresses.find(a => a.id.toString() === selectedAddress);
                        return addr ? (
                          <>
                            <p className="font-medium">{addr.name}</p>
                            <p>{addr.address}</p>
                            <p>Phone: {addr.phone}</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Payment Options */}
                {!isProcessing ? (
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold">Select Payment Method</h3>
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={(value: 'UPI' | 'QR') => setPaymentMethod(value)}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer">
                        <RadioGroupItem value="UPI" id="upi" />
                        <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-semibold text-white">UPI Payment</span>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer">
                        <RadioGroupItem value="QR" id="qr" />
                        <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer">
                          <QrCode className="w-4 h-4" />
                          <span className="font-semibold text-white">QR Code</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'UPI' && (
                      <div className="space-y-2">
                        <Label htmlFor="upi" className="text-white">Enter UPI ID</Label>
                        <Input
                          id="upi"
                          placeholder="username@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    )}

                    {paymentMethod === 'QR' && (
                      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl">
                        <img 
                          src="/qrcode.jpg"
                          alt="PhonePe QR Code"
                          className="w-64 h-auto"
                        />
                        <div className="text-center">
                          <h4 className="text-purple-600 font-semibold text-lg">PhonePe</h4>
                          <p className="text-gray-600">ACCEPTED HERE</p>
                          <p className="text-gray-800 mt-2">Scan & Pay Using PhonePe App</p>
                          <p className="text-gray-500 text-sm mt-4">BONTHU JAYARAM</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-400 text-white font-medium hover:opacity-90"
                      onClick={handlePayment}
                      disabled={!paymentMethod || (paymentMethod === 'UPI' && !upiId)}
                    >
                      Proceed to Pay ₹{(cartTotal || 0).toLocaleString('en-IN')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center"
                      >
                        <Timer className="w-8 h-8 text-purple-400 animate-spin" />
                      </motion.div>
                      <p className="text-white font-medium">Processing Payment...</p>
                      {paymentStatus === 'success' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center space-x-2 text-green-400"
                        >
                          <Check className="w-6 h-6" />
                          <span>Payment successful! Redirecting to orders...</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025, All rights reserved</p>
        </div>
      </div>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-2 animate-fadein">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Address</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              className="grid grid-cols-1 gap-6"
              onSubmit={handleAddNewAddress}
            >
              <div>
                <Label className="text-blue-600 block mb-2">Label</Label>
                <select
                  value={addressForm.label}
                  onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-600 block mb-2">Name</Label>
                  <Input
                    value={addressForm.name}
                    onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full h-12 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <Label className="text-blue-600 block mb-2">Phone</Label>
                  <Input
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full h-12 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter phone"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-blue-600 block mb-2">Address</Label>
                <textarea
                  value={addressForm.address}
                  onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  rows={4}
                  placeholder="Enter full address"
                  required
                />
              </div>
              <div className="flex justify-end items-center gap-3 mt-2">
                <Button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-400 text-white font-medium hover:opacity-90"
                >
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 
