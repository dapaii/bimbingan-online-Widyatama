"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type Props = {
  initialDosen: Dosen[];
};

const PAGE_SIZE = 2;

/* ================= COMPONENT ================= */

const DosenTable = ({ initialDosen }: Props) => {
  const [dosenList, setDosenList] = useState<Dosen[]>(initialDosen);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kuotaDraft, setKuotaDraft] = useState<number>(1);
  const [page, setPage] = useState(1);

  const totalPage = Math.ceil(dosenList.length / PAGE_SIZE);

  const paginated = dosenList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= ACTIONS ================= */

  const toggleActive = async (dosenId: string, current: boolean) => {
    setLoadingId(dosenId);

    await fetch("/api/kaprodi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dosenId,
        isActive: !current,
      }),
    });

    setDosenList((prev) =>
      prev.map((d) =>
        d.id === dosenId ? { ...d, isActive: !current } : d
      )
    );

    setLoadingId(null);
  };

  const saveKuota = async (dosenId: string) => {
    setLoadingId(dosenId);

    await fetch("/api/kaprodi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dosenId,
        kuotaMax: kuotaDraft,
      }),
    });

    setDosenList((prev) =>
      prev.map((d) =>
        d.id === dosenId ? { ...d, kuotaMax: kuotaDraft } : d
      )
    );

    setEditingId(null);
    setLoadingId(null);
  };

  /* ================= RENDER ================= */

  return (
    <div className="rounded-3xl border bg-card p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daftar Dosen</h2>

        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </Button>

          <span className="text-muted-foreground">
            {page} / {totalPage}
          </span>

          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPage}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {paginated.map((dosen) => {
          const isEditing = editingId === dosen.id;
          const kuotaPenuh =
            dosen.kuotaMax > 0 &&
            dosen.kuotaTerpakai >= dosen.kuotaMax;

          return (
            <div
              key={dosen.id}
              className="rounded-2xl border bg-background p-4 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* NAMA */}
                <div className="md:col-span-4">
                  <p className="font-medium">{dosen.nama}</p>
                  <p className="text-sm text-muted-foreground">
                    {dosen.email}
                  </p>
                </div>

                {/* KUOTA */}
                <div className="md:col-span-4 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Kuota Bimbingan
                  </p>

                  {!isEditing ? (
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-semibold ${
                          kuotaPenuh ? "text-destructive" : ""
                        }`}
                      >
                        {dosen.kuotaTerpakai}/{dosen.kuotaMax}
                      </p>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(dosen.id);
                          setKuotaDraft(
                            dosen.kuotaMax > 0 ? dosen.kuotaMax : 1
                          );
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={dosen.kuotaTerpakai}
                        value={kuotaDraft}
                        onChange={(e) =>
                          setKuotaDraft(Number(e.target.value))
                        }
                        className="h-8 w-24"
                      />

                      <Button
                        size="sm"
                        onClick={() => saveKuota(dosen.id)}
                        disabled={loadingId === dosen.id}
                      >
                        Simpan
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  )}

                  {dosen.kuotaMax === 0 && !isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Kuota belum diatur oleh Kaprodi
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <div className="md:col-span-2 flex items-center">
                  <Badge
                    className={
                      dosen.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {dosen.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                {/* ACTION */}
                <div className="md:col-span-2 flex md:justify-end">
                  <Button
                    size="sm"
                    variant={
                      dosen.isActive ? "destructive" : "secondary"
                    }
                    disabled={loadingId === dosen.id}
                    onClick={() =>
                      toggleActive(dosen.id, dosen.isActive)
                    }
                  >
                    {dosen.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>
              </div>

              {/* SKILLS */}
              <div className="flex flex-wrap gap-1">
                {dosen.skills.length > 0 ? (
                  dosen.skills.map(({ skill }) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      {skill.nama}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Belum memilih skill
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loadingId && (
        <p className="text-xs text-muted-foreground">
          Memproses perubahan…
        </p>
      )}
    </div>
  );
};

export default DosenTable;
