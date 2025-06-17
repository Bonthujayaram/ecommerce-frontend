import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Home, Package, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BASE_URL } from '@/config';

interface OrderItem {
  id: number;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  product_description?: string;
  product_image?: string;
}

interface Address {
  id: number;
  label: string;
  name: string;
  phone: string;
  address: string;
}

interface Order {
  id: number;
  user_id: string;
  total_amount: number;
  payment_method: string;
  payment_details: string;
  status: string;
  order_date: string;
  created_at?: string;
  address: Address;
  items: OrderItem[];
}

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user?.id || !orderId) return;

      try {
        // Get profile data
        const profileRes = await fetch(`${BASE_URL}/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!profileRes.ok) {
          const errorData = await profileRes.json();
          throw new Error(errorData.error || 'Failed to fetch profile data');
        }
        
        const profileData = await profileRes.json();

        // Get order details using the user_id from profile
        const orderRes = await fetch(`${BASE_URL}/users/${profileData.id}/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!orderRes.ok) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || 'Failed to fetch order details');
        }
        
        const orderData = await orderRes.json();
        setOrder(orderData);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-500',
      'PAID': 'bg-green-500',
      'PROCESSING': 'bg-blue-500',
      'SHIPPED': 'bg-purple-500',
      'DELIVERED': 'bg-green-600',
      'CANCELLED': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 hover:bg-white/50 text-gray-700 flex items-center gap-2 px-4 py-2 rounded-full transition-all"
            onClick={() => navigate('/profile', { state: { activeTab: 'orders' } })}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-red-600">Error Loading Order</h3>
            <p className="text-gray-500 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate subtotal and total
  const subtotal = order.items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
  const shippingCost: number = 0; // You can modify this based on your business logic
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-white/50 text-gray-700 flex items-center gap-2 px-4 py-2 rounded-full transition-all"
          onClick={() => navigate('/profile', { state: { activeTab: 'orders' } })}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>

        <div className="space-y-8">
          {/* Order Header Card */}
          <Card className="p-8 bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                  <Badge className={`${getStatusColor(order.status)} text-white font-medium px-3 py-1 rounded-full`}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-gray-500">
                  Placed on {format(new Date(order.order_date || order.created_at), 'PPP')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </p>
                <p className="text-gray-500 mt-1">Paid via {order.payment_method}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address Card */}
          <Card className="overflow-hidden bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>
            </div>
            <div className="p-6 bg-white">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {order.address.label}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900">{order.address.name}</p>
                <p className="text-gray-600">{order.address.address}</p>
                <p className="text-gray-600">Phone: {order.address.phone}</p>
              </div>
            </div>
          </Card>

          {/* Order Items Card */}
          <Card className="overflow-hidden bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {item.product_image && (
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-100 p-2 flex items-center justify-center">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h3>
                        <p className="mt-1 text-gray-500 line-clamp-2">
                          {item.product_description}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm text-gray-600">
                            ₹{item.price.toLocaleString('en-IN')} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card className="overflow-hidden bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 
