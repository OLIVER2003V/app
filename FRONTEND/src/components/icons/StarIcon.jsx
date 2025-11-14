import React from 'react';

export default function StarIcon({ className = "w-6 h-6", ...props }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M10.788 3.21c.47-1.113 2.016-1.113 2.486 0l2.353 5.53a.998.998 0 0 0 .93.69h5.823c1.22 0 1.714 1.573.832 2.313l-4.712 3.42a.997.997 0 0 0-.356 1.053l1.785 4.907c.305.84-.703 1.55-1.43.998l-4.713-3.42a1 1 0 0 0-1.175 0l-4.713 3.42c-.727.552-1.734-.158-1.43-.998l1.785-4.907a.997.997 0 0 0-.356-1.053l-4.712-3.42c-.882-.74-.388-2.313.832-2.313h5.823a.998.998 0 0 0 .93-.69l2.353-5.53Z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}