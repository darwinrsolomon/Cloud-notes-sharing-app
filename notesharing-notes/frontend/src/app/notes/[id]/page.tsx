"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getNote, downloadNote, deleteNote, updateNote, aiSummarize, aiAsk, aiQuiz } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";
import {
  FileText, Download, Edit2, Trash2, Brain, MessageSquare, CheckSquare,
  ChevronDown, ChevronUp, Loader2, ArrowLeft, Tag, BookOpen, GraduationCap, Save, X
} from "lucide-react";
import Link from "next/link";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, init } = useAuthStore();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", subject: "", tags: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // AI states
  const [aiTab, setAiTab] = useState<"summary" | "ask" | "quiz" | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    init();
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const res = await getNote(id);
      setNote(res.data);
      setEditForm({ title: res.data.title, description: res.data.description || "", subject: res.data.subject || "", tags: res.data.tags || "" });
    } catch { toast.error("Note not found"); router.push("/dashboard"); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    try {
      const res = await downloadNote(id);
      window.open(res.data.download_url, "_blank");
      toast.success("Download started!");
      setNote((n: any) => ({ ...n, download_count: (n.download_count || 0) + 1 }));
    } catch { toast.error("Download failed"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      router.push("/dashboard");
    } catch { toast.error("Delete failed"); }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await updateNote(id, editForm);
      setNote(res.data);
      setEditing(false);
      toast.success("Note updated!");
    } catch { toast.error("Update failed"); }
    finally { setSavingEdit(false); }
  };

  const handleAISummarize = async () => {
    if (aiSummary) { setAiTab("summary"); return; }
    setAiLoading(true);
    setAiTab("summary");
    try {
      const res = await aiSummarize(id);
      setAiSummary(res.data);
    } catch { toast.error("AI summarization failed"); }
    finally { setAiLoading(false); }
  };

  const handleAIAsk = async () => {
    if (!question.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiAsk(id, question);
      setAnswer(res.data.answer);
    } catch { toast.error("AI Q&A failed"); }
    finally { setAiLoading(false); }
  };

  const handleAIQuiz = async () => {
    if (quiz.length > 0) { setAiTab("quiz"); return; }
    setAiLoading(true);
    setAiTab("quiz");
    try {
      const res = await aiQuiz(id, 5);
      setQuiz(res.data.quiz || []);
    } catch { toast.error("Quiz generation failed"); }
    finally { setAiLoading(false); }
  };

  const canEdit = user && (user.user_id === note?.uploader_id || user.role === "teacher");

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    </div>
  );

  if (!note) return null;

  const date = new Date(note.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        {/* Note Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          {editing ? (
            <div className="space-y-4">
              <input
                className="w-full text-xl font-bold border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Title"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editForm.subject}
                  onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                  placeholder="Subject"
                />
                <input
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editForm.tags}
                  onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                />
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={savingEdit} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{note.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full capitalize font-medium">{note.subject}</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      {note.uploader_role === "teacher" ? <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> : <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                      {note.uploader_name}
                    </span>
                    <span className="text-sm text-gray-400">{date}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleDownload} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => setEditing(true)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={handleDelete} className="p-2 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {note.description && <p className="text-gray-600 mb-4 text-sm leading-relaxed">{note.description}</p>}

              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {note.file_name}</span>
                <span>{Math.round((note.file_size || 0) / 1024)} KB</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {note.download_count} downloads</span>
              </div>

              {note.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Tag className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  {note.tags.split(",").map((tag: string, i: number) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag.trim()}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Features */}
        {user && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" /> AI Study Tools
            </h2>
            <div className="flex gap-2 flex-wrap mb-4">
              <button onClick={handleAISummarize} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiTab === "summary" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}>
                <Brain className="w-3.5 h-3.5" /> Summarize
              </button>
              <button onClick={() => setAiTab("ask")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiTab === "ask" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                <MessageSquare className="w-3.5 h-3.5" /> Ask AI
              </button>
              <button onClick={handleAIQuiz} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiTab === "quiz" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                <CheckSquare className="w-3.5 h-3.5" /> Generate Quiz
              </button>
            </div>

            {aiLoading && (
              <div className="flex items-center gap-2 text-purple-600 py-4">
                <Loader2 className="w-5 h-5 animate-spin" /> Generating with Groq AI...
              </div>
            )}

            {/* Summary */}
            {aiTab === "summary" && !aiLoading && aiSummary && (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2 text-sm">Summary</h4>
                  <p className="text-purple-800 text-sm leading-relaxed">{aiSummary.summary}</p>
                </div>
                {aiSummary.key_points?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Points</h4>
                    <ul className="space-y-1">
                      {aiSummary.key_points.map((pt: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-purple-500 font-bold mt-0.5">•</span> {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiSummary.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {aiSummary.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                {aiSummary.difficulty && (
                  <p className="text-xs text-gray-400">Difficulty: <span className="font-medium capitalize">{aiSummary.difficulty}</span></p>
                )}
              </div>
            )}

            {/* Ask AI */}
            {aiTab === "ask" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask anything about this note..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAIAsk()}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAIAsk} disabled={aiLoading || !question.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">Ask</button>
                </div>
                {answer && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-800 text-sm leading-relaxed">{answer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quiz */}
            {aiTab === "quiz" && !aiLoading && quiz.length > 0 && (
              <div className="space-y-4">
                {quiz.map((q: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 text-sm mb-3">{i + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options?.map((opt: string, j: number) => {
                        const selected = quizAnswers[i] === opt;
                        const isCorrect = quizAnswers[i] && opt === q.answer;
                        const isWrong = selected && opt !== q.answer;
                        return (
                          <button
                            key={j}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [i]: opt })}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                              isCorrect ? "bg-green-50 border-green-400 text-green-800" :
                              isWrong ? "bg-red-50 border-red-400 text-red-800" :
                              selected ? "bg-blue-50 border-blue-400" :
                              "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswers[i] && q.explanation && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
