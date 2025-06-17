import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BASE_URL } from '@/config';

interface OrderItem {
  id: number;
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  uuid: string;
  user_id: string;
  total_amount: number;
  payment_method: string;
  payment_details: string;
  status: string;
  order_date: string;
  created_at?: string;
  address_id: number;
  items: OrderItem[];
}

export const OrdersSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  React.useEffect(() => {
    const fetchOrders = async (retries = 3) => {
      if (!user?.id) return;

      try {
        // First get the user profile to get the correct user ID
        const profileRes = await fetch(`${BASE_URL}/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!profileRes.ok) {
          if (retries > 0 && profileRes.status >= 500) {
            // If server error and retries left, wait and retry
            setRetryCount(prev => prev + 1);
            await delay(2000); // Wait 2 seconds before retrying
            return fetchOrders(retries - 1);
          }
          throw new Error('Failed to fetch user profile');
        }
        const profileData = await profileRes.json();
        
        // Use the user_id from the profile to fetch orders
        const ordersRes = await fetch(`${BASE_URL}/users/${profileData.id}/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!ordersRes.ok) {
          if (retries > 0 && ordersRes.status >= 500) {
            // If server error and retries left, wait and retry
            setRetryCount(prev => prev + 1);
            await delay(2000); // Wait 2 seconds before retrying
            return fetchOrders(retries - 1);
          }
          const errorData = await ordersRes.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }
        
        const ordersData = await ordersRes.json();
        console.log('Orders data:', ordersData); // Debug log
        
        if (Array.isArray(ordersData)) {
          setOrders(ordersData.sort((a, b) => 
            new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
          ));
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error('Invalid orders data format');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-500',
      'PAID': 'bg-green-500',
      'PROCESSING': 'bg-blue-500',
      'SHIPPED': 'bg-purple-500',
      'DELIVERED': 'bg-green-600',
      'CANCELLED': 'bg-red-500'
    };
    return colors[status.toUpperCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-red-600">Error Loading Orders</h3>
        <p className="text-gray-500 mt-2">{error}</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Retried {retryCount} times. The server might be waking up...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700">No Orders Yet</h3>
        <p className="text-gray-500 mt-2">Start shopping to see your orders here!</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/products')}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card 
            key={order.id} 
            className="p-6 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                  <Badge className={`${getStatusColor(order.status)} text-white font-medium`}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(order.order_date || order.created_at), 'PPP')}
                </p>
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600">Paid via {order.payment_method}</p>
                </div>
                
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                  onClick={() => navigate(`/profile/orders/${order.id}`)}
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 
