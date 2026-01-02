"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Save, User, Tags } from "lucide-react";
import { toast } from "sonner";

type Skill = {
  id: string;
  nama: string;
};

type Props = {
  initialNama: string;
  skills: Skill[];
  selectedSkillIds: string[];
  onSaved?: () => void;
};

const UpdateDosenForm = ({
  initialNama,
  skills,
  selectedSkillIds,
  onSaved,
}: Props) => {
  const [nama, setNama] = useState(initialNama);
  const [selected, setSelected] = useState<string[]>(selectedSkillIds);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const submit = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/dosen/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          skillIds: selected,
        }),
      });

      if (!res.ok) throw new Error("Update gagal");

      toast.success("Profil dosen berhasil diperbarui");

      onSaved?.();
    } catch (err) {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">Profil Dosen</h3>
        <p className="text-sm text-muted-foreground">
          Atur nama dan bidang keahlian dosen
        </p>
      </div>

      {/* NAMA */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Nama
        </Label>
        <Input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama dosen"
        />
      </div>

      {/* SKILLS */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tags className="h-4 w-4" />
          Keahlian
        </Label>

        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada data skill tersedia.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => {
              const active = selected.includes(skill.id);

              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`rounded-full px-3 py-1 text-sm border transition
                    ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted hover:bg-muted/70"
                    }
                  `}
                >
                  {skill.nama}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTION */}
      <div className="flex justify-end pt-2">
        <Button onClick={submit} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UpdateDosenForm;
