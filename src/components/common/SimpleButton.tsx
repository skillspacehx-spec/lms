import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

interface SimpleButtonProps {
  href?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

const SimpleButton = ({
  href,
  onClick,
  children,
  className = "",
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ...otherProps
}: SimpleButtonProps) => {
  const baseClassName = `inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;

  const variants = {
    primary: 'bg-[#7AC2F9] text-[#191919] hover:bg-[#6AB4ED] focus:ring-[#7AC2F9]',
    secondary: 'bg-[#191919] text-white hover:bg-[#2a2a2a] focus:ring-[#191919]',
    outline: 'border-2 border-[#7AC2F9] text-[#7AC2F9] hover:bg-[#7AC2F9] hover:text-[#191919] focus:ring-[#7AC2F9]',
    ghost: 'text-gray-600 hover:text-[#191919] hover:bg-gray-100 focus:ring-gray-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const finalClassName = `${baseClassName} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={finalClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={finalClassName}
      disabled={disabled}
      type={type}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default SimpleButton;