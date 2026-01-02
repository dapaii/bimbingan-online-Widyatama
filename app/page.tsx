"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import {
  GraduationCap,
  Users,
  Layers,
  FileText,
  GitMerge,
} from "lucide-react";
import React from "react";

/* ================= TYPES ================= */

type Lang = "id" | "en";

type Stat = {
  label: string;
  value: number;
  accent: "blue" | "orange";
};

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode; // ✅ FIXED
};

type Step = {
  title: string;
  desc: string;
};

type Content = {
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;

  sectionIntegratedTitle: string;
  sectionIntegratedDesc: string;
  flowTitle: string;

  stats: Stat[];
  features: Feature[];
  steps: Step[];
  footer: string;
};


/* ================= PAGE ================= */

const Home = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) router.replace("/auth-sync");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  const t = content[lang];

  return (
    <main className="relative bg-background overflow-hidden">

      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-200px] h-[520px] w-[520px] rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      {/* ================= HERO ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16 grid lg:grid-cols-12 gap-14 items-center">

        {/* LEFT */}
        <motion.div
          className="lg:col-span-6 space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <GraduationCap className="text-blue-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-xl text-muted-foreground">
            {t.heroSubtitle}
          </p>

          <p className="max-w-xl text-muted-foreground">
            {t.heroDesc}
          </p>

          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="mt-4 w-fit rounded-full border px-4 py-1 text-xs"
          >
            {lang === "id" ? "EN" : "ID"}
          </button>
        </motion.div>

        {/* RIGHT – STATS */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {t.stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 grid lg:grid-cols-3 gap-6">

        <motion.div
          className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border p-8 shadow-lg"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <GitMerge className="text-blue-600" />
            <h3 className="text-xl font-semibold">
              {t.sectionIntegratedTitle}
            </h3>

          </div>
          <p className="text-muted-foreground max-w-xl">
            {t.sectionIntegratedDesc}
          </p>
        </motion.div>

        <div className="space-y-6">
          {t.features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur border p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                {f.icon}
                <h4 className="font-semibold">{f.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FLOW ================= */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-center mb-10">
          {t.flowTitle}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {t.steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur border p-6 text-center"
            >
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground">
        {t.footer}
      </footer>
    </main>
  );
};

export default Home;

/* ================= COMPONENTS ================= */

const StatCard = ({ label, value, accent }: Stat) => {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useMotionValueEvent(mv, "change", (v) => {
    setDisplay(Math.round(v).toLocaleString());
  });

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.5 });
    return controls.stop;
  }, [mv, value]);

  return (
    <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border p-6 text-center">
      <p
        className={`text-3xl font-bold ${accent === "blue" ? "text-blue-600" : "text-orange-500"
          }`}
      >
        {display}+
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

/* ================= CONTENT ================= */

const content: Record<Lang, Content> = {
  id: {
    heroTitle: "Sistem Akademik Terintegrasi",
    heroSubtitle: "Akademik tertata, transparan, dan bertanggung jawab",
    heroDesc:
      "Platform resmi Universitas Widyatama untuk mengelola pembimbing, keahlian, dan pengajuan mahasiswa secara terstruktur.",

    sectionIntegratedTitle: "Sistem Akademik Terintegrasi",
    sectionIntegratedDesc:
      "Seluruh proses akademik berada dalam satu sistem terstruktur, transparan, dan terkontrol.",

    flowTitle: "Alur Akademik",

    stats: [
      { label: "Dosen Aktif", value: 128, accent: "blue" },
      { label: "Mahasiswa", value: 3200, accent: "orange" },
      { label: "Bidang Keahlian", value: 42, accent: "blue" },
      { label: "Pengajuan / Tahun", value: 1500, accent: "orange" },
    ],

    features: [
      {
        title: "Manajemen Dosen",
        desc: "Monitoring kuota dan status bimbingan.",
        icon: <Users className="text-blue-600" />,
      },
      {
        title: "Master Skill",
        desc: "Standarisasi keahlian pembimbing.",
        icon: <Layers className="text-blue-600" />,
      },
      {
        title: "Pengajuan Terstruktur",
        desc: "Workflow jelas dan terdokumentasi.",
        icon: <FileText className="text-blue-600" />,
      },
    ],

    steps: [
      { title: "Mahasiswa Mengajukan", desc: "Pilih dosen sesuai keahlian." },
      { title: "Dosen Menyetujui", desc: "Validasi dan persetujuan." },
      { title: "Kaprodi Monitoring", desc: "Distribusi adil dan terkontrol." },
    ],

    footer: "Sistem Akademik • Universitas Widyatama",
  },

  en: {
    heroTitle: "Integrated Academic System",
    heroSubtitle: "Structured and accountable academic workflows",
    heroDesc:
      "Official Universitas Widyatama platform for managing supervisors, expertise, and student submissions.",

    sectionIntegratedTitle: "Integrated Academic System",
    sectionIntegratedDesc:
      "All academic processes are managed within a single structured and transparent system.",

    flowTitle: "Academic Flow",

    stats: [
      { label: "Active Lecturers", value: 128, accent: "blue" },
      { label: "Students", value: 3200, accent: "orange" },
      { label: "Expertise Areas", value: 42, accent: "blue" },
      { label: "Submissions / Year", value: 1500, accent: "orange" },
    ],

    features: [
      {
        title: "Lecturer Management",
        desc: "Quota and availability monitoring.",
        icon: <Users className="text-blue-600" />,
      },
      {
        title: "Skill Master",
        desc: "Expertise standardization.",
        icon: <Layers className="text-blue-600" />,
      },
      {
        title: "Structured Submission",
        desc: "Clear academic workflow.",
        icon: <FileText className="text-blue-600" />,
      },
    ],

    steps: [
      { title: "Student Submission", desc: "Request supervisor." },
      { title: "Lecturer Review", desc: "Approve or reject." },
      { title: "Head Monitoring", desc: "Ensure balance." },
    ],

    footer: "Academic System • Universitas Widyatama",
  },
};

