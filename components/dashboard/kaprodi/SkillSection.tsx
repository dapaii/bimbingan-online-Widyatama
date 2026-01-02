"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Skill = {
  id: string;
  nama: string;
};

type Props = {
  skills: Skill[];
};

const SkillSection = ({ skills }: Props) => {
  const [list, setList] = useState<Skill[]>(skills);
  const [nama, setNama] = useState("");

  const addSkill = async (): Promise<void> => {
    if (!nama.trim()) return;

    const res = await fetch("/api/kaprodi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama }),
    });

    if (!res.ok) return;

    const created: Skill = await res.json();
    setList((prev) => [...prev, created]);
    setNama("");
  };

  return (
    <div
      className="
        rounded-3xl border bg-card p-6
        flex flex-col
        min-h-[360px]
      "
    >
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Master Skill</h2>
        <p className="text-sm text-muted-foreground">
          Daftar bidang keahlian dosen
        </p>
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mb-4">
        <input
          className="
            h-9 flex-1 rounded-md border bg-background px-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary
          "
          placeholder="Tambah skill baru"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <Button size="sm" onClick={addSkill}>
          Tambah
        </Button>
      </div>

      {/* SKILL LIST */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada skill terdaftar.
            </p>
          ) : (
            list.map((s) => (
              <Badge
                key={s.id}
                variant="outline"
                className="
                  rounded-md px-2.5 py-1
                  text-xs font-normal
                  text-muted-foreground
                  bg-background
                "
              >
                {s.nama}
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillSection;
