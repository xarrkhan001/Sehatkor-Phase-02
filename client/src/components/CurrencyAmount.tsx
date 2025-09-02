import React from 'react';

interface CurrencyAmountProps {
  amount?: number | null;
  currency?: string; // default 'PKR'
  loading?: boolean;
  masked?: boolean; // when true, show bullets instead of value
  className?: string;
  fallback?: string; // shown when amount is undefined/null
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  currency = 'PKR',
  loading = false,
  masked = false,
  className = '',
  fallback = '0',
}) => {
  if (loading) return <span className={className}>...</span>;
  if (masked) return <span className={className}>••••••</span>;

  const value = typeof amount === 'number' && isFinite(amount)
    ? amount.toLocaleString()
    : fallback;

  return (
    <span className={className}>{`${currency} ${value}`}</span>
  );
};

export default CurrencyAmount;
