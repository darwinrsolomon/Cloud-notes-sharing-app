import Link from "next/link";
import { BookOpen, Upload, Search, Brain, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" /> AI-Powered Study Notes Platform
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Share & Discover<br />Study Notes Together
          </h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            A centralized cloud platform for students and teachers. Upload PDFs, PPTs, and DOCs.
            Search instantly. Get AI summaries. Never lose notes again.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">
              Browse Notes
            </Link>
            <Link href="/register" className="bg-indigo-500 hover:bg-indigo-400 border border-white/30 font-bold px-8 py-3 rounded-xl transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need to study smarter</h2>
        <p className="text-center text-gray-500 mb-14">Built for students and teachers who value organized, accessible knowledge.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Upload, title: "Upload Notes", desc: "Share PDFs, PowerPoints, and Word docs. Organized by subject and searchable instantly.", color: "text-blue-600 bg-blue-50" },
            { icon: Search, title: "Smart Search", desc: "Find notes by subject, topic, or keyword. AI tags make discovery effortless.", color: "text-green-600 bg-green-50" },
            { icon: Brain, title: "AI Summaries", desc: "Groq-powered AI summarizes notes, generates quizzes, and answers your questions.", color: "text-purple-600 bg-purple-50" },
            { icon: Users, title: "Teachers & Students", desc: "Teachers upload verified content. Students share peer notes. Both benefit.", color: "text-orange-600 bg-orange-50" },
            { icon: Shield, title: "Secure Storage", desc: "Files stored in AWS S3 with encryption. Metadata in DynamoDB. Always accessible.", color: "text-red-600 bg-red-50" },
            { icon: BookOpen, title: "Study Anywhere", desc: "Access notes from any device, anytime. Download for offline study.", color: "text-indigo-600 bg-indigo-50" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-50 border-t border-indigo-100 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to study smarter?</h2>
        <p className="text-gray-500 mb-8">Join thousands of students and teachers on NoteSharing.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">Create Account</Link>
          <Link href="/dashboard" className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-8 py-3 rounded-xl border border-gray-200 transition-colors">Browse Notes</Link>
        </div>
      </section>
    </main>
    </>
  );
}
