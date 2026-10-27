"use client";

import React, { useState, useRef } from "react";
import { Patrick_Hand } from "next/font/google";
import { toPng } from "html-to-image";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Lightbulb,
  GitBranch,
  Download,
  Check,
  Copy,
  Zap,
} from "lucide-react";
import MermaidChart from "@/components/MermaidChart";

// Load handwritten marker font
const markerFont = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
});

interface CoreConcept {
  term: string;
  definition: string;
  keyword: string;
}

interface StudySheetData {
  title: string;
  subject: string;
  coreConcepts: CoreConcept[];
  processFlow: string[];
  mermaidDiagram: string;
  mnemonic: string;
}

// 1-Click Sample Topics for fast live demos!
const SAMPLE_TOPICS = [
  {
    label: "⚡ Fizik: Prinsip Pascal",
    notes:
      "Prinsip Pascal menyatakan bahawa tekanan yang dikenakan ke atas cecair tertutup akan dipindahkan secara seragam ke semua arah dalam cecair itu. Formula tekanan ialah P = F/A. Dalam sistem hidraulik sebagai pengganda daya, F1/A1 = F2/A2 di mana daya input kecil F1 pada omboh kecil A1 menghasilkan daya output besar F2 pada omboh besar A2. Contoh aplikasi: jek hidraulik dan brek hidraulik kereta.",
  },
  {
    label: "🧪 Kimia: Teori Pelanggaran",
    notes:
      "Teori Pelanggaran (Collision Theory): Zarah bahan tindak balas mesti berlanggar antara satu sama lain untuk tindak balas berlaku. Tindak balas berjaya hanya berlaku melalui pelanggaran berkesan (effective collision) yang memenuhi dua syarat: (1) Zarah mencapai tenaga pengaktifan minimum (Ea), dan (2) Zarah berlanggar pada orientasi yang betul. Kadar tindak balas meningkat apabila frekuensi pelanggaran berkesan meningkat.",
  },
  {
    label: "📈 Ekonomi: Pendapatan Boleh Guna",
    notes:
      "Pendapatan Boleh Guna ialah jumlah pendapatan sebenar isi rumah yang boleh dibelanjakan selepas ditolak potongan wajib seperti cukai pendapatan, caruman KWSP, PERKESO, dan zakat. Formula: Pendapatan Boleh Guna = Jumlah Pendapatan - Potongan Wajib. Ia digunakan untuk membeli barang keperluan (makanan, tempat tinggal) dan kehendak (telefon pintar, melancong) serta tabungan.",
  },
];

const INITIAL_MOCK_SHEET: StudySheetData = {
  title: "Prinsip Pascal / Pascal's Principle",
  subject: "Fizik / Physics",
  coreConcepts: [
    {
      term: "Definisi Prinsip Pascal",
      definition:
        "Tekanan yang dikenakan ke atas cecair tertutup dipindahkan secara seragam ke semua arah.",
      keyword: "Cecair Tertutup & Seragam",
    },
    {
      term: "Formula Asas Tekanan",
      definition:
        "Tekanan ialah daya per unit luas permukaan yang berserenjang.",
      keyword: "P = F / A (Unit: Pa atau N m⁻²)",
    },
    {
      term: "Sistem Hidraulik (Gandakan Daya)",
      definition:
        "Daya kecil pada omboh kecil menghasilkan daya besar pada omboh besar.",
      keyword: "F₁ / A₁ = F₂ / A₂",
    },
  ],
  processFlow: [
    "Daya kecil (F₁) dikenakan pada omboh kecil (A₁)",
    "Tekanan (P = F₁/A₁) terhasil di dalam cecair hidraulik",
    "Tekanan dipindahkan secara seragam ke seluruh cecair",
    "Omboh besar (A₂) menerima daya angkat yang jauh lebih besar (F₂)",
  ],
  mermaidDiagram:
    'graph TD; A["Daya Kecil (F1) pada Omboh Kecil (A1)"] --> B["Tekanan P = F1 / A1 Terhasil"]; B --> C["Dipindahkan Seragam Dalam Cecair"]; C --> D["Daya Besar (F2) pada Omboh Besar (A2)"];',
  mnemonic: "P-A-S-C-A-L: Pressure Always Spreads Completely Across Liquid!",
};

export default function HomePage() {
  const [notes, setNotes] = useState("");
  const [sheet, setSheet] = useState<StudySheetData>(INITIAL_MOCK_SHEET);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Ref pointing ONLY to the plain-white study card for clean PNG export
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (customNotes?: string) => {
    const textToProcess = customNotes ?? notes;
    if (!textToProcess.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: textToProcess }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setSheet(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // High-res PNG Download for WhatsApp / Telegram sharing
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 2x Retina resolution so marker text is crisp on phones!
        backgroundColor: "#ffffff",
      });

      const safeFileName = sheet.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const link = document.createElement("a");
      link.download = `${safeFileName || "study-notes"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
      setError("Failed to export PNG image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Bonus: Copy Image directly to Windows Clipboard (Ctrl+V into WhatsApp/Telegram!)
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-4 md:p-8 text-neutral-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls, Sample Pills & Raw Input (4 cols) */}
        <section className="lg:col-span-4 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-6 h-6 text-blue-700" />
            <h1 className="text-xl font-bold tracking-tight">
              1-Click Visual Study Notes
            </h1>
          </div>

          <p className="text-sm text-neutral-600 mb-4">
            Paste messy lecture notes or click a sample topic below to generate a marker-style revision sheet ready for WhatsApp & Telegram.
          </p>

          {/* 1-Click Sample Topic Pills */}
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1 mb-2">
              <Zap className="w-3.5 h-3.5 text-red-600" />
              Try Sample Topic (1-Click Demo):
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TOPICS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNotes(sample.notes);
                    handleGenerate(sample.notes);
                  }}
                  disabled={loading}
                  className="text-xs bg-neutral-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-neutral-300 px-2.5 py-1.5 rounded-md font-medium transition disabled:opacity-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes here..."
            rows={7}
            className="w-full p-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !notes.trim()}
            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-neutral-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Drawing Marker Notes..." : "Generate Visual Cheat-Sheet"}
          </button>
        </section>

        {/* RIGHT COLUMN: Export Action Bar + Plain White Marker Canvas (8 cols) */}
        <section className="lg:col-span-8">
          
          {/* Top Action Bar (Outside cardRef so buttons don't appear in the exported PNG!) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-white px-4 py-3 rounded-xl border border-neutral-200 shadow-sm">
            <span className="text-sm font-medium text-neutral-600">
              Preview Canvas (Plain White Marker Style)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyImage}
                className="px-3 py-2 text-sm font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-700" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={exporting}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting PNG..." : "Download PNG"}
              </button>
            </div>
          </div>

          {/* EXPORTABLE MARKER CANVAS (Referenced by cardRef) */}
          <div
            ref={cardRef}
            className={`${markerFont.className} bg-white p-6 md:p-10 rounded-none shadow-sm text-neutral-900 tracking-wide`}
          >
            {/* Header Section */}
            <div className="border-b-4 border-neutral-900 pb-3 mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-700">
                {sheet.title}
              </h2>
              <span className="px-3 py-0.5 border-2 border-neutral-900 text-red-600 font-bold text-lg rotate-[-1deg]">
                {sheet.subject}
              </span>
            </div>

            {/* 1. Core Concepts Grid (Black marker boxes, Blue headings, Red keywords) */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-blue-700 mb-3 underline decoration-neutral-900 decoration-2">
                1. Konsep Utama & Kata Kunci
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sheet.coreConcepts.map((item, index) => (
                  <div
                    key={index}
                    className="border-2 border-neutral-900 p-4 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xl font-bold text-blue-700 mb-1">
                        • {item.term}
                      </div>
                      <p className="text-lg text-neutral-900 leading-snug mb-3">
                        {item.definition}
                      </p>
                    </div>
                    <div className="border-t-2 border-dashed border-neutral-900 pt-2 text-red-600 font-bold text-lg">
                      ★ Fokus: {item.keyword}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Step-by-Step Process & Visual Flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left: Numbered Marker Steps */}
              <div className="border-2 border-neutral-900 p-4 bg-white">
                <h3 className="text-2xl font-bold text-blue-700 mb-3 flex items-center gap-1.5">
                  <ArrowRight className="w-5 h-5 text-red-600" />
                  Langkah Demi Langkah
                </h3>
                <ul className="space-y-2.5">
                  {sheet.processFlow.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-lg leading-snug">
                      <span className="font-bold text-red-600">[{idx + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Mermaid Flowchart Box */}
              <div className="border-2 border-neutral-900 p-4 bg-white flex flex-col justify-between">
                <h3 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-1.5">
                  <GitBranch className="w-5 h-5 text-red-600" />
                  Carta Alir Ringkas
                </h3>
                <MermaidChart
                  chart={sheet.mermaidDiagram}
                  fallbackSteps={sheet.processFlow}
                />
              </div>
            </div>

            {/* 3. Bottom Mnemonic / Memory Tip Box */}
            <div className="border-2 border-neutral-900 p-4 bg-white flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <span className="text-blue-700 font-bold text-xl mr-2">
                  Tip Ingatan Pantas (Mnemonic):
                </span>
                <span className="text-red-600 font-bold text-xl">
                  {sheet.mnemonic}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
