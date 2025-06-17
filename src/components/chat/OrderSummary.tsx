
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types/chat';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
  return (
    <Card className="mt-4 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Summary</CardTitle>
          <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Items:</span>
            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.product.name} x{item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </CardContent>
    </Card>
  );
};
