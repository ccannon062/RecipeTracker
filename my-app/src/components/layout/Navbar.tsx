import Link from "next/link";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { IoPersonCircle } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";

export default function Navbar() {
  const [isActive, setActive] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, logout, loading } = useAuth();

  const toggleMenu = () => {
    setActive(!isActive);
  };

  const handleLogout = async () => {
    await logout();
    setActive(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setActive(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-[#344e41] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <div className="color-[#dad7cd] text-2xl font-bold cursor-pointer hover:">
              Recipe Tracker
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              className="hover:bg-[#a3b18a1a] p-2 pl-4 pr-4 rounded transition delay-100"
              href="/"
            >
              Home
            </Link>
            <Link
              className="hover:bg-[#a3b18a1a] p-2 pl-4 pr-4 rounded transition delay-100"
              href="/recipes/new"
            >
              Add Recipe
            </Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <IoPersonCircle size={24} />
                      <span className="font-semibold">{user.Username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-[#a3b18a] px-4 py-2 rounded hover:bg-[#588157] transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-4 py-2 rounded hover:bg-[#a3b18a1a] transition"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="bg-[#a3b18a] px-4 py-2 rounded hover:bg-[#588157] transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="md:hidden">
            <IoMdMenu
              onClick={toggleMenu}
              className="color-white cursor-pointer"
              size="2em"
            />
          </div>
        </div>
      </div>
      {isActive && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu} />
      )}
      <div
        className={`fixed top-0 right-0 w-[200px] h-screen bg-[#344e41] p-4 shadow-lg border-l-3 border-[#a3b18a1a] transform transition-transform duration-300 ease-in-out z-50 ${
          isActive ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <IoMdClose
          className="absolute top-4 right-4 cursor-pointer"
          size="2em"
          onClick={toggleMenu}
        />
        <ul className="mt-16">
          <li>
            <Link
              href="/"
              onClick={toggleMenu}
              className="block py-3 hover:bg-[#a3b18a1a] rounded px-2"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/recipes/new"
              onClick={toggleMenu}
              className="block py-3 hover:bg-[#a3b18a1a] rounded px-2"
            >
              Add Recipe
            </Link>
          </li>
          {!loading && (
            <>
              {user ? (
                <>
                  <li className="mt-8 px-2 py-3 border-t border-[#a3b18a1a]">
                    <div className="flex items-center gap-2 mb-3">
                      <IoPersonCircle size={24} />
                      <span className="font-semibold">{user.Username}</span>
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-3 hover:bg-[#a3b18a1a] rounded px-2"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="mt-8 border-t border-[#a3b18a1a] pt-4">
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        toggleMenu();
                      }}
                      className="w-full text-left py-3 hover:bg-[#a3b18a1a] rounded px-2"
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowSignupModal(true);
                        toggleMenu();
                      }}
                      className="w-full text-left py-3 hover:bg-[#a3b18a1a] rounded px-2"
                    >
                      Sign Up
                    </button>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </nav>
  );
}
