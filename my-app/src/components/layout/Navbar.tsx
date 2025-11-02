import Link from "next/link";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isActive, setActive] = useState(false);

  const toggleMenu = () => {
    setActive(!isActive);
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
          <div className="hidden md:block flex gap-6">
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
              Recipe
            </Link>
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
        </ul>
      </div>
    </nav>
  );
}
