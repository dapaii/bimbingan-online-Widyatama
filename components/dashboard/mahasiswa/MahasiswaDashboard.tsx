import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { GraduationCap, User, CheckCircle, Clock, XCircle, Info, Layers, AlertCircle,} from "lucide-react";
import AjukanDosenDialog from "@/components/dashboard/mahasiswa/AjukanDosenDialog";
import EditMahasiswaDialog from "@/components/dashboard/mahasiswa/EditMahasiswaDialog";

/* ================= TYPES ================= */
type PengajuanStatus = "MENUNGGU" | "DISETUJUI" | "DITOLAK";

/* ================= TIMER CONFIG ================= */
const COOLDOWN_MINUTES = 15;

/* ================= UTIL ================= */
const formatDateID = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const getRemainingMinutes = (updatedAt?: Date) => {
  if (!updatedAt) return 0;

  const now = Date.now();
  const last = new Date(updatedAt).getTime();
  const diffMinutes = Math.floor((now - last) / 60000);

  return Math.max(COOLDOWN_MINUTES - diffMinutes, 0);
};

const getStatusBadge = (status: PengajuanStatus) => {
  if (status === "MENUNGGU")
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Menunggu Review
      </Badge>
    );

  if (status === "DISETUJUI")
    return (
      <Badge className="gap-1 bg-green-600 text-white">
        <CheckCircle className="h-3 w-3" />
        Disetujui
      </Badge>
    );

  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      Ditolak
    </Badge>
  );
};

/* ================= STEP COMPONENT ================= */
const Step = ({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) => {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-lg border p-4",
        done && "border-green-500 bg-green-500/10",
        active && !done && "border-primary bg-primary/10",
        !active && !done && "bg-muted/30",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border",
          done && "bg-green-600 border-green-600 text-white",
          active && !done && "border-primary text-primary",
          !active && !done && "text-muted-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {done ? <CheckCircle className="h-4 w-4" /> : <span>•</span>}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {done && <span className="text-xs text-green-600">Selesai</span>}
        {active && !done && (
          <span className="text-xs text-primary">Sedang diproses</span>
        )}
      </div>
    </div>
  );
};

/* ================= REUSABLE CARD ================= */
const SummaryCard = ({
  icon,
  title,
  value,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="rounded-xl border bg-card p-5 flex justify-between gap-4">
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

/* ================= PAGE ================= */
const MahasiswaDashboard = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: {
      mahasiswa: {
        include: {
          pengajuan: { include: { dosen: true } },
        },
      },
    },
  });

  if (!profile || profile.role !== "MAHASISWA") redirect("/unauthorized");

  const mahasiswa = profile.mahasiswa;
  const pengajuan = mahasiswa?.pengajuan ?? null;
  const status = (pengajuan?.status ?? null) as PengajuanStatus | null;

  // TIMER: hanya berlaku kalau status DITOLAK
  const remainingMinutes =
    status === "DITOLAK" ? getRemainingMinutes(pengajuan?.updatedAt) : 0;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <div className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Dashboard Mahasiswa
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Kelola data diri, status pengajuan, dan progres bimbingan secara efisien.
              </p>
            </div>

            <div className="h-px w-full bg-muted" />
          </div>
        </div>


        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<User className="h-5 w-5" />}
            title="Mahasiswa"
            value={mahasiswa?.nama ?? "-"}
            subtitle={mahasiswa?.nim ?? "NIM belum diisi"}
            action={
              <EditMahasiswaDialog
                nama={mahasiswa?.nama ?? null}
                nim={mahasiswa?.nim ?? null}
              />
            }
          />

          <SummaryCard
            icon={<Layers className="h-5 w-5" />}
            title="Status Pengajuan"
            value={status ?? "Belum Mengajukan"}
            subtitle={
              pengajuan?.createdAt
                ? `Diajukan ${formatDateID(pengajuan.createdAt)}`
                : "Belum ada data"
            }
          />

          <SummaryCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Dosen Pembimbing"
            value={pengajuan?.dosen?.nama ?? "Belum ditentukan"}
            subtitle={
              pengajuan?.dosen
                ? `${pengajuan.dosen.kuotaTerpakai}/${pengajuan.dosen.kuotaMax} kuota`
                : "Menunggu penetapan"
            }
          />

          <SummaryCard
            icon={<Info className="h-5 w-5" />}
            title="Status Sistem"
            value="Aktif"
            subtitle={profile.email}
          />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Detail Pengajuan</h2>

              {!pengajuan ? (
                <div className="flex gap-3 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Belum ada pengajuan</p>
                    <p className="text-xs mt-1">
                      Silakan ajukan dosen pembimbing untuk memulai proses.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    {getStatusBadge(pengajuan.status)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">
                        Tanggal Pengajuan
                      </p>
                      <p className="mt-1 font-medium">
                        {formatDateID(pengajuan.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">
                        Update Terakhir
                      </p>
                      <p className="mt-1 font-medium">
                        {formatDateID(pengajuan.updatedAt)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PROGRESS */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-base font-semibold mb-4">
                Alur Proses Bimbingan
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Step label="Pengajuan dibuat" done={!!pengajuan} />
                <Step
                  label="Review dosen"
                  active={status === "MENUNGGU"}
                  done={status === "DISETUJUI" || status === "DITOLAK"}
                />
                <Step
                  label="Disetujui"
                  active={status === "DISETUJUI"}
                  done={status === "DISETUJUI"}
                />
                <Step label="Ditolak" active={status === "DITOLAK"} />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-4">
<div className="rounded-xl border bg-card p-6 space-y-5">
  {/* Header */}
  <div className="flex flex-col gap-1">
    <h2 className="text-lg font-semibold">Aksi</h2>
    <p className="text-sm text-muted-foreground">
      Kelola proses pengajuan dosen pembimbing kamu di sini.
    </p>
  </div>

  <div className="h-px w-full bg-muted" />

  {/* BELUM ADA PENGAJUAN */}
  {!pengajuan && (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Kamu belum mengajukan dosen pembimbing.
      </div>

      <AjukanDosenDialog
        dosenList={await prisma.dosen.findMany({
          where: {
            isActive: true,
            kuotaTerpakai: { lt: prisma.dosen.fields.kuotaMax },
          },
          include: {
            skills: { include: { skill: true } },
          },
          orderBy: { kuotaTerpakai: "asc" },
        })}
      />
    </div>
  )}

  {/* STATUS MENUNGGU */}
  {status === "MENUNGGU" && (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
      <Clock className="mt-0.5 h-4 w-4" />
      <div>
        <p className="font-medium text-foreground">
          Pengajuan sedang direview
        </p>
        <p className="text-xs">
          Dosen pembimbing sedang memeriksa pengajuan kamu.
        </p>
      </div>
    </div>
  )}

  {/* STATUS DITOLAK */}
  {status === "DITOLAK" && (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-medium">Pengajuan ditolak</p>
          <p className="text-xs">
            Silakan ajukan ulang dengan memilih dosen pembimbing lain.
          </p>
        </div>
      </div>

      {/* TIMER COOLDOWN */}
      {remainingMinutes > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Kamu bisa mengajukan ulang dalam{" "}
            <span className="font-semibold">
              {remainingMinutes} menit
            </span>
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Waktu tunggu selesai. Silakan ajukan kembali.
          </p>

          <AjukanDosenDialog
            dosenList={await prisma.dosen.findMany({
              where: {
                isActive: true,
                kuotaTerpakai: { lt: prisma.dosen.fields.kuotaMax },
              },
              include: {
                skills: { include: { skill: true } },
              },
              orderBy: { kuotaTerpakai: "asc" },
            })}
          />
        </div>
      )}
    </div>
  )}

  {/* STATUS DISETUJUI */}
  {status === "DISETUJUI" && (
    <div className="flex items-start gap-3 rounded-lg border bg-green-500/10 p-4 text-sm text-green-700">
      <CheckCircle className="mt-0.5 h-4 w-4" />
      <div>
        <p className="font-medium">Pengajuan disetujui</p>
        <p className="text-xs">
          Kamu sudah resmi memiliki dosen pembimbing.
        </p>
      </div>
    </div>
  )}
</div>


            <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
              Sistem ini membantu pengelolaan pengajuan dosen pembimbing secara
              transparan dan terstruktur.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaDashboard;
