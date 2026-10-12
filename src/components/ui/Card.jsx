import { cn } from '../../utils/cn';

export function Card({ children, className, variant = 'default', ...props }) {
  const variants = {
    default: 'glass rounded-2xl shadow-xl p-5 sm:p-8',
    solid: 'bg-navy-light rounded-2xl shadow-xl p-5 sm:p-8 border border-white/5',
    highlight: 'glass glow-gold rounded-2xl shadow-xl p-5 sm:p-8 border border-gold/20',
  };

  return (
    <div
      className={cn(variants[variant] || variants.default, className)}
      {...props}
    >
      {children}
    </div>
  );
}
