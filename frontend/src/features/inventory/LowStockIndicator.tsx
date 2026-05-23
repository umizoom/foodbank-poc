interface LowStockIndicatorProps {
  stockCount: number;
  threshold: number;
}

export function LowStockIndicator({ stockCount, threshold }: LowStockIndicatorProps) {
  if (stockCount === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800" data-testid="stock-critical">
        Out of stock
      </span>
    );
  }

  if (stockCount <= threshold) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" data-testid="stock-warning">
        Low stock
      </span>
    );
  }

  return null;
}
