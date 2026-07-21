import React from 'react';

const PlacesIcon = ({ className = "h-5 w-5" }) => (
    <svg 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth="2"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
        />
    </svg>
);

export default PlacesIcon;
