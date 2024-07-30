import React from "react";

interface BoxIconCheckProps {
  width?: number;
  height?: number;
}

const BoxIconCheck: React.FC<BoxIconCheckProps> = ({ width = 68, height = 68 }) => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_b_623_20409)">
      <rect width="68" height="68" rx="34" fill="url(#paint0_linear_623_20409)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.8582 24.7664C46.7694 25.6776 46.7694 27.155 45.8582 28.0663L32.6831 41.2413C31.3163 42.6081 29.1002 42.6081 27.7334 41.2413L22.1417 35.6496C21.2304 34.7384 21.2304 33.261 22.1417 32.3498C23.0529 31.4385 24.5303 31.4385 25.4415 32.3498L30.2083 37.1165L42.5583 24.7664C43.4696 23.8552 44.9469 23.8552 45.8582 24.7664Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_b_623_20409"
        x="-26"
        y="-26"
        width="120"
        height="120"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="13" />
        <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_623_20409" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_623_20409" result="shape" />
      </filter>
      <linearGradient
        id="paint0_linear_623_20409"
        x1="78.88"
        y1="137.02"
        x2="-12.5786"
        y2="25.9097"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF9524" />
        <stop offset="1" stopColor="#5B4DFF" />
      </linearGradient>
    </defs>
  </svg>
);

export default BoxIconCheck;
