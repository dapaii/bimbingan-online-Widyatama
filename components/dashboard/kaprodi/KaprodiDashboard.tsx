import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DosenTable from "./DosenTable";
import SkillSection from "./SkillSection";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";

/* ================= TYPES ================= */

type Skill = {
  id: string;
  nama: string;
};

type DosenSkillItem = {
  skill: Skill;
};

type Dosen = {
  id: string;
  nama: string;
  email: string;
  kuotaMax: number;
  kuotaTerpakai: number;
  isActive: boolean;
  skills: DosenSkillItem[];
};

/* ================= COMPONENT ================= */

const KaprodiDashboard = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!profile || profile.role !== "KAPRODI") {
    redirect("/unauthorized");
  }

  /* ===== DOSEN ===== */
  const dosenList: Dosen[] = await prisma.dosen
    .findMany({
      select: {
        id: true,
        nama: true,
        kuotaMax: true,
        kuotaTerpakai: true,
        isActive: true,
        profile: { select: { email: true } },
        skills: {
          select: {
            skill: { select: { id: true, nama: true } },
          },
        },
      },
      orderBy: { nama: "asc" },
    })
    .then((rows) =>
      rows.map((d) => ({
        id: d.id,
        nama: d.nama,
        email: d.profile.email,
        kuotaMax: d.kuotaMax,
        kuotaTerpakai: d.kuotaTerpakai,
        isActive: d.isActive,
        skills: d.skills,
      }))
    );

  /* ===== SKILL ===== */
  const skills: Skill[] = await prisma.skill.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });

  /* ===== SUMMARY ===== */
  const totalDosen = dosenList.length;
  const dosenAktif = dosenList.filter((d) => d.isActive).length;
  const kuotaPenuh = dosenList.filter(
    (d) => d.kuotaTerpakai >= d.kuotaMax
  ).length;

  return (
    <div className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* ================= HEADER ================= */}
        <div className="rounded-3xl border bg-card p-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Kaprodi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring dosen pembimbing dan pengelolaan master skill.
          </p>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Summary
            icon={<Users />}
            title="Total Dosen"
            value={String(totalDosen)}
            tone="neutral"
          />
          <Summary
            icon={<CheckCircle />}
            title="Dosen Aktif"
            value={String(dosenAktif)}
            tone="success"
          />
          <Summary
            icon={<AlertCircle />}
            title="Kuota Penuh"
            value={String(kuotaPenuh)}
            tone="warning"
          />
          <Summary
            icon={<Layers />}
            title="Total Skill"
            value={String(skills.length)}
            tone="info"
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT – DOSEN */}
          <div className="lg:col-span-8">
            <DosenTable initialDosen={dosenList} />
          </div>

          {/* RIGHT – SKILL */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <SkillSection skills={skills} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default KaprodiDashboard;

/* ================= UI HELPER ================= */

const Summary = ({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "neutral" | "info" | "warning" | "success";
}) => {
  const toneMap: Record<typeof tone, string> = {
    neutral: "bg-muted text-foreground",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-yellow-100 text-yellow-700",
    success: "bg-green-100 text-green-700",
  };

  return (
    <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${toneMap[tone]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};
