"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type PengajuanDTO = {
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
  pengajuan: PengajuanDTO;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
};

const PengajuanCard = ({ pengajuan, onApprove, onReject }: Props) => {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const approve = async () => {
    try {
      setLoading("approve");
      await onApprove(pengajuan.id);

      toast.success("Pengajuan berhasil disetujui");
    } catch (err) {
      toast.error("Gagal menyetujui pengajuan");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    try {
      setLoading("reject");
      await onReject(pengajuan.id);

      toast.success("Pengajuan berhasil ditolak");
    } catch (err) {
      toast.error("Gagal menolak pengajuan");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 transition hover:shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {pengajuan.mahasiswa.nama}
          </p>
          <p className="text-sm text-muted-foreground">
            NIM: {pengajuan.mahasiswa.nim}
          </p>
        </div>

        {pengajuan.status === "MENUNGGU" && (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Menunggu
          </Badge>
        )}

        {pengajuan.status === "DISETUJUI" && (
          <Badge className="bg-green-600 text-white gap-1">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </Badge>
        )}

        {pengajuan.status === "DITOLAK" && (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Ditolak
          </Badge>
        )}
      </div>

      {/* META */}
      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <p className="text-[11px]">Tanggal Pengajuan</p>
          <p className="font-medium text-foreground">
            {new Date(pengajuan.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <p className="text-[11px]">Update Terakhir</p>
          <p className="font-medium text-foreground">
            {new Date(pengajuan.updatedAt).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* ACTION */}
      {pengajuan.status === "MENUNGGU" && (
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={approve} disabled={loading !== null}>
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Setujui
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            disabled={loading !== null}
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Tolak
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PengajuanCard;
