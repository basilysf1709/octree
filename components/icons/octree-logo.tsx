export function OctreeLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_334_158)">
        <mask
          id="mask0_334_158"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="48"
          height="48"
        >
          <path
            d="M36 0H12C5.37258 0 0 5.37258 0 12V36C0 42.6274 5.37258 48 12 48H36C42.6274 48 48 42.6274 48 36V12C48 5.37258 42.6274 0 36 0Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_334_158)">
          <path
            d="M36 0H12C5.37258 0 0 5.37258 0 12V36C0 42.6274 5.37258 48 12 48H36C42.6274 48 48 42.6274 48 36V12C48 5.37258 42.6274 0 36 0Z"
            fill="#1E66FF"
          />
          <path d="M0 0H48V48H0V0Z" fill="url(#paint0_linear_334_158)" />
        </g>
        <path
          d="M36 1H12C5.92487 1 1 5.92487 1 12V36C1 42.0751 5.92487 47 12 47H36C42.0751 47 47 42.0751 47 36V12C47 5.92487 42.0751 1 36 1Z"
          stroke="url(#paint1_linear_334_158)"
          strokeWidth="2"
        />
        <path
          d="M14.6667 13.3333C13.4388 13.3333 12.4445 14.3289 12.4445 15.5555V36C12.4445 37.2266 13.44 38.2222 14.6667 38.2222H29.7778C31.0045 38.2222 32 37.2266 32 36V26.6666C32 25.4879 31.5318 24.3574 30.6983 23.5239C29.8648 22.6905 28.7343 22.2222 27.5556 22.2222H25.3333C24.744 22.2222 24.1787 21.9881 23.762 21.5713C23.3453 21.1546 23.1111 20.5893 23.1111 20V17.7778C23.1111 16.599 22.6429 15.4686 21.8094 14.6351C20.9759 13.8016 19.8454 13.3333 18.6667 13.3333H14.6667Z"
          fill="url(#paint2_linear_334_158)"
        />
        <path
          d="M18.2222 9.77777C16.9944 9.77777 16 10.7733 16 12V32.4444C16 33.6711 16.9956 34.6667 18.2222 34.6667H33.3333C34.56 34.6667 35.5556 33.6711 35.5556 32.4444V23.1111C35.5556 21.9324 35.0873 20.8019 34.2538 19.9684C33.4203 19.1349 32.2899 18.6667 31.1111 18.6667H28.8889C28.2995 18.6667 27.7343 18.4325 27.3175 18.0158C26.9008 17.599 26.6667 17.0338 26.6667 16.4444V14.2222C26.6667 13.0435 26.1984 11.913 25.3649 11.0795C24.5314 10.246 23.401 9.77777 22.2222 9.77777H18.2222Z"
          fill="url(#paint3_linear_334_158)"
        />
        <path
          d="M26.9286 10.1523C27.9082 11.2817 28.4465 12.7272 28.4444 14.2222V16.4444C28.4444 16.6898 28.6436 16.8889 28.8889 16.8889H31.1111C32.6062 16.8868 34.0516 17.4252 35.181 18.4047C34.6596 16.4216 33.6208 14.6125 32.1708 13.1625C30.7208 11.7125 28.9117 10.6737 26.9286 10.1523Z"
          fill="url(#paint4_linear_334_158)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_334_158"
          x1="24"
          y1="-5.96046e-08"
          x2="26"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_334_158"
          x1="24"
          y1="-5.05344e-08"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.12" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_334_158"
          x1="22.2222"
          y1="13.3333"
          x2="22.2222"
          y2="38.2222"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#628CFC" />
          <stop offset="1" stopColor="#759BFC" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_334_158"
          x1="25.7778"
          y1="9.77777"
          x2="25.7778"
          y2="34.6667"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D1DFFF" />
          <stop offset="1" stopColor="#9ABAFF" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_334_158"
          x1="31.0548"
          y1="10.1523"
          x2="31.0548"
          y2="18.4047"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6597FF" />
          <stop offset="1" stopColor="#7AA6FF" />
        </linearGradient>
        <clipPath id="clip0_334_158">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
