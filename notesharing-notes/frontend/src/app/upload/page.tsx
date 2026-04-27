"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { uploadNote } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";
import { Upload, FileText, X, CheckCircle, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["mathematics", "physics", "chemistry", "biology", "computer science", "history", "english", "economics", "other"];
const ALLOWED = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"];

export default function UploadPage() {
  const router = useRouter();
  const { user, init } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", subject: "mathematics", description: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => { init(); }, [init]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to upload notes</h2>
            <p className="text-gray-500 mb-6">Create an account to share your study materials</p>
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) { toast.error(`File type not allowed. Use: ${ALLOWED.join(", ")}`); return; }
    if (f.size > 50 * 1024 * 1024) { toast.error("File too large (max 50MB)"); return; }
    setFile(f);
    if (!form.title) setForm(prev => ({ ...prev, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.title.trim());
    fd.append("subject", form.subject);
    fd.append("description", form.description.trim());
    fd.append("tags", form.tags.trim());
    try {
      const res = await uploadNote(fd);
      toast.success("Note uploaded successfully!");
      router.push(`/notes/${res.data.note_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const sizeKB = file ? Math.round(file.size / 1024) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Study Notes</h1>
          <p className="text-gray-500 text-sm">Share PDFs, presentations, and documents with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${drag ? "border-indigo-400 bg-indigo-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"}`}
          >
            <input ref={fileRef} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm">{file.name}</div>
                  <div className="text-xs text-gray-400">{sizeKB} KB · {file.type || "document"}</div>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="ml-2 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-700 mb-1">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-400">PDF, DOC, DOCX, PPT, PPTX, TXT · Max 50MB</p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Calculus Chapter 3 - Derivatives"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Subject <span className="text-red-500">*</span></label>
            <select
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white capitalize"
            >
              {SUBJECTS.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="What topics does this cover? Any important context..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input
              type="text"
              placeholder="e.g. derivatives, calculus, math101, midterm"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Analyzing...</> : <><Upload className="w-4 h-4" /> Upload Note</>}
            </button>
            <Link href="/dashboard" className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm flex items-center">
              Cancel
            </Link>
          </div>

          {loading && (
            <div className="text-center text-sm text-indigo-600 bg-indigo-50 rounded-xl p-4">
              Uploading to S3 and generating AI summary with Groq...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
