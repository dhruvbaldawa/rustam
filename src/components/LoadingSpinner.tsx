// ABOUTME: Loading spinner component for various loading states
// ABOUTME: Uses CSS animation for performant, accessible loading indicator

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'slate' | 'green' | 'red';
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', color = 'white', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'text-white',
    slate: 'text-slate-300',
    green: 'text-green-500',
    red: 'text-red-500'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} spinner`} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className={`text-sm ${colorClasses[color]}`}>{text}</p>
      )}
    </div>
  );
};

// Loading dots animation for text
export const LoadingDots = ({ text = 'Loading', color = 'white' }: { text?: string; color?: 'white' | 'slate' }) => {
  const colorClasses = {
    white: 'text-white',
    slate: 'text-slate-300'
  };

  return (
    <div className={`flex items-center gap-1 ${colorClasses[color]}`}>
      <span>{text}</span>
      <span className="pulse-dot">.</span>
      <span className="pulse-dot">.</span>
      <span className="pulse-dot">.</span>
    </div>
  );
};