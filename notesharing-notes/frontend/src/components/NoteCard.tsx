"use client";
import Link from "next/link";
import { FileText, Download, Eye, BookOpen, GraduationCap } from "lucide-react";

interface Note {
  note_id: string;
  title: string;
  description?: string;
  subject: string;
  tags?: string;
  uploader_name: string;
  uploader_role: string;
  file_name: string;
  file_type: string;
  file_size: number;
  download_count: number;
  ai_summary?: string;
  created_at: string;
}

export default function NoteCard({ note }: { note: Note }) {
  const typeColors: Record<string, string> = {
    pdf: "bg-red-100 text-red-700",
    docx: "bg-blue-100 text-blue-700",
    doc: "bg-blue-100 text-blue-700",
    pptx: "bg-orange-100 text-orange-700",
    ppt: "bg-orange-100 text-orange-700",
    txt: "bg-gray-100 text-gray-700",
  };

  const ext = note.file_type?.toLowerCase() || "txt";
  const badgeClass = typeColors[ext] || "bg-gray-100 text-gray-700";
  const sizeKB = Math.round((note.file_size || 0) / 1024);
  const date = note.created_at ? new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{note.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{note.subject}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-md flex-shrink-0 uppercase ${badgeClass}`}>{ext}</span>
      </div>

      {note.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{note.description}</p>
      )}

      {note.ai_summary && (
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-indigo-700 line-clamp-2">
            <span className="font-semibold">AI: </span>{note.ai_summary}
          </p>
        </div>
      )}

      {note.tags && (
        <div className="flex flex-wrap gap-1">
          {note.tags.split(",").slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {note.uploader_role === "teacher" ? (
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="truncate max-w-24">{note.uploader_name}</span>
          <span className="text-gray-300">·</span>
          <span>{sizeKB} KB</span>
          <span className="text-gray-300">·</span>
          <Download className="w-3 h-3" />
          <span>{note.download_count}</span>
        </div>
        <Link
          href={`/notes/${note.note_id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </Link>
      </div>
    </div>
  );
}
