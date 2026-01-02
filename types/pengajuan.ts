export type PengajuanStatus = "MENUNGGU" | "DISETUJUI" | "DITOLAK";

export interface MahasiswaDTO {
  id: string;
  nama: string;
  nim: string;
}

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

