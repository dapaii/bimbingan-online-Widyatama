"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

type Props = {
  nama: string | null;
  nim: string | null;
};

const EditMahasiswaDialog = ({ nama, nim }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: nama ?? "",
    nim: nim ?? "",
  });

  const submit = async () => {
    if (!form.nama.trim() || !form.nim.trim()) {
      toast.error("Nama dan NIM wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/mahasiswa/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama.trim(),
          nim: form.nim.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ⬅️ PENTING: baca error dari API kamu
        toast.error(data.error);
        return;
      }

      toast.success("Data mahasiswa berhasil diperbarui");
      setOpen(false);
      window.location.reload();
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-6 flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Edit Data Mahasiswa</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Perbarui data identitas mahasiswa kamu
          </p>

          <div className="grid gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={form.nama}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nama: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">NIM</label>
              <Input
                value={form.nim}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nim: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditMahasiswaDialog;
