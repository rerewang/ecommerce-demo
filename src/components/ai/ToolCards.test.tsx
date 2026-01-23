import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { OrderCard } from './cards/OrderCard';
import { ReturnCard } from './cards/ReturnCard';
import { AlertCard } from './cards/AlertCard';

describe('Chatbot Tool Cards', () => {
  describe('OrderCard', () => {
    it('renders order details and timeline', () => {
      const mockOrder = {
        orderId: 'ord-123',
        status: 'shipped',
        total: 120,
        shippingAddress: { city: 'New York' },
        timeline: [
          { label: 'Ordered', status: 'completed', date: '2023-10-01' },
          { label: 'Shipped', status: 'current', date: '2023-10-03' },
        ]
      };

      render(<OrderCard data={mockOrder} />);
      
      expect(screen.getByText('Order #ord-123')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
      expect(screen.getByText('$120')).toBeInTheDocument();
      expect(screen.getByText('Ordered')).toBeInTheDocument();
    });
  });

  describe('ReturnCard', () => {
    it('renders eligible return status', () => {
      const mockReturn = {
        orderId: 'ord-456',
        eligible: true,
        reason: 'Within 30 days',
        policy: { windowDays: 30 }
      };

      render(<ReturnCard data={mockReturn} />);
      
      expect(screen.getByText('Return Eligible')).toBeInTheDocument();
      expect(screen.getByText('Within 30 days')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start return/i })).toBeInTheDocument();
    });

    it('renders ineligible return status', () => {
      const mockReturn = {
        orderId: 'ord-789',
        eligible: false,
        reason: 'Past 30 days',
        policy: { windowDays: 30 }
      };

      render(<ReturnCard data={mockReturn} />);
      
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
      expect(screen.getByText('Past 30 days')).toBeInTheDocument();
    });
  });

  describe('AlertCard', () => {
    it('renders success message for created alert', () => {
      const mockAlert = {
        id: 'alert-1',
        productId: 'prod-1',
        type: 'price_drop' as const,
        targetPrice: 50,
        message: 'Alert set successfully'
      };

      render(<AlertCard data={mockAlert} />);
      
      expect(screen.getByText('Alert set successfully')).toBeInTheDocument();
      // Use regex for partial match since "Price Drop" is part of "Price Drop Alert Set"
      expect(screen.getByText(/Price Drop/)).toBeInTheDocument();
      expect(screen.getByText(/Target: \$50/)).toBeInTheDocument();
    });
  });
});
