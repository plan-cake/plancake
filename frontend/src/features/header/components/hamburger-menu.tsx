import React, { useState } from "react";

import Link from "next/link";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button type="button" onClick={toggleMenu} className="focus:outline-none">
        {!isOpen ? (
          // Hamburger Icon
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="white"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          // "X" Icon
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="white"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-2.5 top-6 flex">
          {/* Vertical Line */}
          <div className="h-38 bg-lion w-1 rounded shadow-lg" />

          {/* Dropdown Menu */}
          <div className="w-60 text-xl">
            <ul className="flex flex-col space-y-1 p-4">
              <li>
                <Link href="/new-event" className="tracking-wide">
                  Mix Your First Plan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="tracking-wide">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="tracking-wide">
                  About Plancake
                </Link>
              </li>
              <li>
                <Link href="/login" className="tracking-wide">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
