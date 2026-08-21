function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="36" height="36" rx="9" fill="#4F46E5" />
        <path
          d="M9 21L14.5 15.5L18.5 19.5L27 11"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 11H27V17"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="21" r="1.8" fill="white" />
        <circle cx="27" cy="25" r="1.8" fill="#A5B4FC" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-gray-800">
        Track<span className="text-indigo-600">IQ</span>
      </span>
    </div>
  )
}

export default Logo