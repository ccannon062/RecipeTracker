import Link from "next/link";
import { IoMdMenu } from "react-icons/io";
import { useState } from "react";

export default function Navbar() {
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
            <IoMdMenu className="color-white cursor-pointer" size="2em" />
          </div>
        </div>
      </div>
    </nav>
  );
}
