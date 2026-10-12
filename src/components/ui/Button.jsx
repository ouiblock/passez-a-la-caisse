import { cn } from '../../utils/cn';

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer';
  
  const variants = {
    primary: 'bg-gradient-to-r from-gold to-gold-light text-navy hover:from-gold-light hover:to-gold hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0 font-bold',
    secondary: 'bg-navy-lighter text-gray-200 hover:bg-navy-light hover:text-white border border-white/10 hover:border-white/20 hover:-translate-y-0.5',
    outline: 'border-2 border-gold/60 text-gold hover:bg-gold/10 hover:border-gold font-semibold hover:-translate-y-0.5',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
    xl: 'px-10 py-5 text-xl gap-3',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
