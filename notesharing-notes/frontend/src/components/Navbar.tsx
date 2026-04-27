"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Upload, Home, User, LogOut, Search, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function Navbar() {
  const { user, logout, init } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { init(); }, [init]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 text-xl">
            <BookOpen className="w-6 h-6" />
            NoteSharing
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              <Home className="w-4 h-4" /> Browse
            </Link>
            {user && (
              <Link href="/upload" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" /> Upload
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">{user.name || user.email}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${user.role === "teacher" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {user.role}
                  </span>
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors">Login</Link>
                <Link href="/register" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Sign up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
          <Link href="/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Browse Notes</Link>
          {user && <Link href="/upload" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Upload Note</Link>}
          {user ? (
            <button onClick={handleLogout} className="block py-2 text-red-600 font-medium w-full text-left">Logout</button>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2 text-indigo-600 font-semibold" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
