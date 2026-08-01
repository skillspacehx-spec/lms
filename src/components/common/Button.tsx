/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  [key: string]: any;
}

const Button = ({
  href,
  onClick,
  children,
  className = "",
  icon = <ArrowRight size={16} strokeWidth={2} />,
  ...otherProps
}: ButtonProps) => {
  const baseClassName = `group inline-flex items-center justify-center
    bg-[#7AC2F9] text-black 
    rounded-full 
    pl-3 sm:pl-4 md:pl-5 pr-0 py-1 sm:py-1.5
    transition-all 
    hover:bg-[#6AB4ED]
    w-auto min-w-fit
    ${className}`;

  const content = (
    <>
      <span className="font-semibold text-xs sm:text-sm mr-2 sm:mr-3 whitespace-nowrap">{children}</span>

      {/* Circle touching the edge - color controlled by parent */}
      <span
        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full 
        flex items-center justify-center 
        -mr-1 transition-all flex-shrink-0
        ${className?.includes('bg-[#191919]') ? 'bg-white text-[#191919] group-hover:bg-gray-100' : 'bg-[#191919] text-white group-hover:bg-[#2a2a2a]'}`}
      >
        <span className="w-3 h-3 sm:w-4 sm:h-4">{icon}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseClassName + " h-8 sm:h-9 md:h-10"}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={baseClassName + " h-8 sm:h-9 md:h-10"}
      {...otherProps}
    >
      {content}
    </button>
  );
};

export default Button;