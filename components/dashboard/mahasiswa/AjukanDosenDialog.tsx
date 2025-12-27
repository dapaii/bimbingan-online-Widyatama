"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Search, Info,} from "lucide-react";

/* ================= TYPES ================= */
type Skill = {
  id: string;
  nama: string;
};

type DosenSkill = {
  skill: Skill;
};

type Dosen = {
  id: string;
  nama: string;
  kuotaMax: number;
  kuotaTerpakai: number;
  skills: DosenSkill[];
};

type Props = {
  dosenList: Dosen[];
};

const PAGE_SIZE = 5;

/* ================= COMPONENT ================= */

const AjukanDosenDialog = ({ dosenList }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Dosen | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return dosenList.filter((d) =>
      d.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, dosenList]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const visibleItems = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const handleSubmit = async () => {
    if (!selected) return;

    try {
      setLoadingId(selected.id);

      const res = await fetch("/api/pengajuan", {
        method: "POST",
        body: new URLSearchParams({ dosenId: selected.id }),
      });

      if (!res.ok) {
        alert("Gagal mengajukan dosen");
        return;
      }

      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const getKuotaPercent = (d: Dosen) =>
    Math.min(100, (d.kuotaTerpakai / d.kuotaMax) * 100);

  const getKuotaBadge = (d: Dosen) => {
    if (d.kuotaTerpakai >= d.kuotaMax)
      return <Badge variant="destructive">Penuh</Badge>;

    if (getKuotaPercent(d) >= 70)
      return <Badge variant="secondary">Hampir Penuh</Badge>;

    return <Badge variant="outline">Tersedia</Badge>;
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        Ajukan Dosen Pembimbing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {/* HEADER */}
          <div className="border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Pilih Dosen Pembimbing
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Cari dan pilih dosen sesuai bidang keahlian dan kuota yang tersedia.
              </p>
            </DialogHeader>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama dosen..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-12 divide-x min-h-7xl">
            {/* LIST DOSEN */}
            <div className="col-span-5 overflow-y-auto">
              {visibleItems.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">
                  Tidak ada dosen yang cocok dengan pencarian.
                </div>
              )}

              {visibleItems.map((dosen) => {
                const percent = getKuotaPercent(dosen);

                return (
                  <button
                    key={dosen.id}
                    onClick={() => setSelected(dosen)}
                    className={`w-full text-left px-5 py-4 border-b transition
                      ${
                        selected?.id === dosen.id
                          ? "bg-muted"
                          : "hover:bg-muted/40"
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{dosen.nama}</p>
                          {getKuotaBadge(dosen)}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Dosen Pembimbing
                        </p>

                        <div className="mt-2">
                          <Progress value={percent} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {dosen.kuotaTerpakai}/{dosen.kuotaMax} mahasiswa
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* DETAIL PANEL */}
            <div className="col-span-7 p-6">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                  <Info className="h-6 w-6" />
                  <p className="text-sm">
                    Pilih salah satu dosen untuk melihat detail dan mengajukan
                    permohonan bimbingan.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* HEADER */}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selected.nama}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Dosen Pembimbing
                    </p>
                  </div>

                  {/* KUOTA */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Kuota Bimbingan</span>
                      <span>
                        {selected.kuotaTerpakai}/{selected.kuotaMax}
                      </span>
                    </div>
                    <Progress value={getKuotaPercent(selected)} />
                  </div>

                  {/* SKILL */}
                  <div>
                    <p className="text-sm font-medium mb-2">Bidang Keahlian</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Belum ada data keahlian
                        </span>
                      ) : (
                        selected.skills.map((item) => (
                          <Badge key={item.skill.id} variant="secondary">
                            {item.skill.nama}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      Informasi Pengajuan
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Setiap mahasiswa hanya dapat memiliki satu dosen.</li>
                      <li>Pengajuan akan ditinjau oleh dosen terkait.</li>
                      <li>Jika ditolak, kamu bisa mengajukan ulang.</li>
                      <li>Kuota bersifat terbatas dan dapat berubah.</li>
                    </ul>
                  </div>

                  {/* ACTION */}
                  <div className="pt-4 border-t">
                    {selected.kuotaTerpakai >= selected.kuotaMax ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Kuota Penuh
                      </Badge>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={loadingId === selected.id}
                        className="w-full gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {loadingId === selected.id
                          ? "Mengajukan..."
                          : "Ajukan Dosen Ini"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t px-6 py-3 text-sm text-muted-foreground">
            <span>
              Menampilkan {Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari{" "}
              {filtered.length} dosen
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AjukanDosenDialog;
