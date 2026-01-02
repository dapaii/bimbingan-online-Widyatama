"use client";

import { useState } from "react";
import { User, Layers, Clock, CheckCircle, Settings, Search, } from "lucide-react";
import PengajuanCard from "./PengajuanCard";
import UpdateDosenForm from "./UpdateDosenForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Skill = {
  id: string;
  nama: string;
};

type Pengajuan = {
  id: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
  updatedAt: string;
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
  };
};

type Props = {
  dosen: {
    nama: string;
    kuotaMax: number;
    kuotaTerpakai: number;
    skills: Skill[];
    pengajuan: Pengajuan[];
  };
  allSkills: Skill[];
};

const PAGE_SIZE = 2;

const DosenDashboard = ({ dosen, allSkills }: Props) => {
  const [data, setData] = useState(dosen);
  const [pagePending, setPagePending] = useState(1);
  const [pageHistory, setPageHistory] = useState(1);
  const [search, setSearch] = useState("");

  const reload = async () => {
    const res = await fetch("/api/dosen/me");
    if (!res.ok) return;
    setData(await res.json());
  };

  /* ================= ACTIONS ================= */
  const approve = async (id: string) => {
    await fetch("/api/dosen/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengajuanId: id }),
    });

    setData(prev => ({
      ...prev,
      pengajuan: prev.pengajuan.map(p =>
        p.id === id ? { ...p, status: "DISETUJUI" } : p
      ),
    }));
  };

  const reject = async (id: string) => {
    await fetch("/api/dosen/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengajuanId: id }),
    });

    setData(prev => ({
      ...prev,
      pengajuan: prev.pengajuan.map(p =>
        p.id === id ? { ...p, status: "DITOLAK" } : p
      ),
    }));
  };

  /* ================= FILTER + SEARCH ================= */
  const filtered = data.pengajuan.filter(p =>
    `${p.mahasiswa.nama} ${p.mahasiswa.nim}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const menunggu = filtered.filter(p => p.status === "MENUNGGU");
  const riwayat = filtered.filter(p => p.status !== "MENUNGGU");

  const paginatedMenunggu = menunggu.slice(
    (pagePending - 1) * PAGE_SIZE,
    pagePending * PAGE_SIZE
  );

  const paginatedRiwayat = riwayat.slice(
    (pageHistory - 1) * PAGE_SIZE,
    pageHistory * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-muted/30 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="rounded-3xl border bg-linear-to-br from-background to-muted p-8">
          <h1 className="text-3xl font-bold">Dashboard Dosen</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pengajuan mahasiswa & bidang keahlian bimbingan</p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Summary icon={<User />} title="Nama" value={data.nama} tone="neutral" />
          <Summary
            icon={<Layers />}
            title="Kuota"
            value={`${data.kuotaTerpakai}/${data.kuotaMax}`}
            tone="info"
          />
          <Summary
            icon={<Clock />}
            title="Menunggu"
            value={`${menunggu.length}`}
            tone="warning"
          />
          <Summary
            icon={<CheckCircle />}
            title="Disetujui"
            value={`${riwayat.filter(r => r.status === "DISETUJUI").length}`}
            tone="success"
          />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border bg-card p-6 space-y-4">

              {/* SEARCH */}
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPagePending(1); setPageHistory(1); }}
                  placeholder="Cari nama / NIM..."
                  className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <Tabs defaultValue="pending">
                <TabsList className="mb-3">
                  <TabsTrigger value="pending">Menunggu ({menunggu.length})</TabsTrigger>
                  <TabsTrigger value="history">Riwayat ({riwayat.length})</TabsTrigger>
                </TabsList>

                {/* MENUNGGU */}
                <TabsContent value="pending">
                  <div className="h-105 overflow-y-auto space-y-4 pr-1">
                    {paginatedMenunggu.length === 0 ? (
                      <EmptyState text="Tidak ada pengajuan menunggu." />
                    ) : (
                      paginatedMenunggu.map(p => (
                        <PengajuanCard
                          key={p.id}
                          pengajuan={p}
                          onApprove={approve}
                          onReject={reject}
                        />
                      ))
                    )}
                  </div>

                  {menunggu.length > PAGE_SIZE && (
                    <Pagination
                      page={pagePending}
                      total={menunggu.length}
                      onChange={setPagePending}
                    />
                  )}
                </TabsContent>

                {/* RIWAYAT */}
                <TabsContent value="history">
                  <div className="h-105 overflow-y-auto space-y-4 pr-1">
                    {paginatedRiwayat.length === 0 ? (
                      <EmptyState text="Belum ada riwayat pengajuan." />
                    ) : (
                      paginatedRiwayat.map(p => (
                        <PengajuanCard
                          key={p.id}
                          pengajuan={p}
                          onApprove={async () => { }}
                          onReject={async () => { }}
                        />
                      ))
                    )}
                  </div>

                  {riwayat.length > PAGE_SIZE && (
                    <Pagination
                      page={pageHistory}
                      total={riwayat.length}
                      onChange={setPageHistory}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-6 rounded-3xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h3 className="font-semibold">Profil Dosen</h3>
              </div>

              <UpdateDosenForm
                initialNama={data.nama}
                skills={allSkills}
                selectedSkillIds={data.skills.map(s => s.id)}
                onSaved={reload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DosenDashboard;

/* ================= UI HELPERS ================= */

const Pagination = ({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex justify-between pt-4 text-sm">
    <button className="text-muted-foreground hover:text-foreground disabled:opacity-40"
      disabled={page === 1}
      onClick={() => onChange(page - 1)}
    >
      ← Sebelumnya
    </button>

    <button className="text-muted-foreground hover:text-foreground disabled:opacity-40"
      disabled={page * PAGE_SIZE >= total}
      onClick={() => onChange(page + 1)}
    >
      Berikutnya →
    </button>
  </div>
);

const Summary = ({ icon, title, value, tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "neutral" | "info" | "warning" | "success";
}) => {
  const toneMap = {
    neutral: "bg-muted",
    info: "bg-blue-100 text-blue-600",
    warning: "bg-yellow-100 text-yellow-600",
    success: "bg-green-100 text-green-600",
  };

  return (
    <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground border rounded-xl bg-muted/30">
    {text}
  </div>
);
