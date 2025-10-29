import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Left: Logo/Brand */}
          <Link href="/">
            <div className="text-2xl font-bold cursor-pointer hover:text-blue-100">
              Recipe Tracker
            </div>
          </Link>

          {/* Right: Navigation Links */}
          <div className="flex gap-6">
            <Link href="/">{/* Home link with styling */}</Link>
            <Link href="/recipes/new">
              {/* Add Recipe link with styling */}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
