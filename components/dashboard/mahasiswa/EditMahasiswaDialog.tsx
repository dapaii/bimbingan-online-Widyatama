"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

type Props = {
  nama: string | null;
  nim: string | null;
};

const EditMahasiswaDialog = ({ nama, nim }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nama: nama ?? "",
    nim: nim ?? "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    const res = await fetch("/api/mahasiswa/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Gagal menyimpan data");
    }

    setLoading(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] max-w-2xl p-6 h-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Data Mahasiswa</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Perbarui data identitas mahasiswa kamu
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama</label>
                <Input
                  value={form.nama}
                  onChange={(e) =>
                    setForm({ ...form, nama: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">NIM</label>
                <Input
                  value={form.nim}
                  onChange={(e) =>
                    setForm({ ...form, nim: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full"
                onClick={submit}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditMahasiswaDialog;
