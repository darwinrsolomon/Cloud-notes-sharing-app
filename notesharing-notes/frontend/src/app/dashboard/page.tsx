"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import NoteCard from "@/components/NoteCard";
import { getNotes } from "@/lib/api";
import { Search, BookOpen, Loader2, Filter } from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["All", "mathematics", "physics", "chemistry", "biology", "computer science", "history", "english", "economics", "other"];

export default function DashboardPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [searchInput, setSearchInput] = useState("");

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      else if (subject !== "All") params.subject = subject;
      const res = await getNotes(params);
      setNotes(res.data);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [search, subject]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setSubject("All");
  };

  const handleSubject = (s: string) => {
    setSubject(s);
    setSearch("");
    setSearchInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Notes Library</h1>
          <p className="text-gray-500">Discover and download notes from students and teachers</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, subject, or keyword..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Search
          </button>
          {(search || subject !== "All") && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setSubject("All"); }}
              className="bg-white hover:bg-gray-50 text-gray-600 font-medium px-4 py-3 rounded-xl border border-gray-300 transition-colors text-sm">
              Clear
            </button>
          )}
        </form>

        {/* Subject filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => handleSubject(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${subject === s && !search ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes found</h3>
            <p className="text-gray-400 mb-6">Be the first to upload notes for this topic!</p>
            <Link href="/upload" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Upload Notes
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? "s" : ""} found</p>
              <Link href="/upload" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">+ Upload Note</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note: any) => <NoteCard key={note.note_id} note={note} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
