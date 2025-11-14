import React from 'react';

export default function UserIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor"
      {...props}
    >
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.98 9.98 0 0 0 10 18c2.31 0 4.438-.784 6.125-2.095a1.23 1.23 0 0 0 .41-1.412A9.98 9.98 0 0 0 10 12c-2.31 0-4.438.784-6.125 2.095Z" />
    </svg>
  );
}