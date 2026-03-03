"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type StatementRow = {
  tanggalWaktu: string;
  sumberTujuan: string;
  rincianTransaksi: string;
  catatan: string;
  jumlah: number | null;
  saldo: number | null;
};

type ParseResult = {
  rowCount: number;
  rows: StatementRow[];
  csv: string;
  xlsxBase64: string;
};

function formatAmount(value: number | null, forceSign = false): string {
  if (value === null) {
    return "-";
  }

  const absolute = Math.abs(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absolute);

  if (value < 0) {
    return `-${formatted}`;
  }

  if (forceSign) {
    return `+${formatted}`;
  }

  return formatted;
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function downloadBase64File(
  base64: string,
  filename: string,
  mimeType: string,
) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const previewRows = useMemo(() => result?.rows.slice(0, 20) ?? [], [result]);

  const handleParse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Pilih file PDF dulu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as
        | ParseResult
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Gagal parse PDF");
      }

      setResult(payload);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Terjadi kesalahan tidak dikenal.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full max-w-none flex-col gap-6 bg-zinc-50 px-6 py-10 font-sans text-zinc-900 lg:px-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              JagoPDFtoExcel
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Bank Statement Parser
            </p>
          </div>
          <Image
            src="/bank-jago-logo.svg"
            alt="Bank Jago"
            width={160}
            height={40}
            priority
          />
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-700">
          Dear JAGO, ak cm pgn bank statementku gampang dipindah-pindah, is it
          too much to ask?
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Data tetap di perangkat kamu
          </span>
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            Data Aman?
          </button>
        </div>

        <form
          className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-end"
          onSubmit={handleParse}
        >
          <div className="flex w-full flex-col gap-2 text-sm font-medium text-black">
            <span>File PDF</span>
            <div className="flex h-11 items-center gap-3 rounded-lg border border-zinc-300 bg-white px-3 py-2">
              <label
                htmlFor="pdf-file-input"
                className="inline-flex cursor-pointer items-center rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200"
              >
                Pilih File
              </label>
              <span className="truncate text-sm text-zinc-600">
                {file ? file.name : "Belum ada file dipilih"}
              </span>
              <input
                id="pdf-file-input"
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Parse PDF"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      {result ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-zinc-700">
              {result.rowCount} baris transaksi terdeteksi.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(result.csv, "jago-statement.csv", "text/csv")
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBase64File(
                    result.xlsxBase64,
                    "jago-statement.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  )
                }
                className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Download Excel
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm text-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100">
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Tanggal &amp; Waktu
                  </th>
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Sumber/Tujuan
                  </th>
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Rincian Transaksi
                  </th>
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Catatan
                  </th>
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Jumlah
                  </th>
                  <th className="px-2 py-2 font-semibold text-zinc-900">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr
                    key={`${row.tanggalWaktu}-${index}`}
                    className="border-b border-zinc-200 align-top odd:bg-white even:bg-zinc-50"
                  >
                    <td className="px-2 py-2 text-zinc-900">
                      {row.tanggalWaktu}
                    </td>
                    <td className="px-2 py-2 text-zinc-900">
                      {row.sumberTujuan}
                    </td>
                    <td className="px-2 py-2 text-zinc-900">
                      {row.rincianTransaksi}
                    </td>
                    <td className="px-2 py-2 text-zinc-900">{row.catatan}</td>
                    <td
                      className={`px-2 py-2 text-right font-medium ${
                        (row.jumlah ?? 0) < 0
                          ? "text-red-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {formatAmount(row.jumlah, true)}
                    </td>
                    <td className="px-2 py-2 text-right font-medium text-zinc-900">
                      {formatAmount(row.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-zinc-700">
            Menampilkan maksimal 20 baris pertama sebagai preview.
          </p>
        </section>
      ) : null}

      <footer className="mt-auto rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
        <p>
          JagoPDFtoExcel — Parse mutasi Bank Jago dari PDF ke CSV/Excel.
          Prompted with ❤️ by @dkmhndr_
        </p>
      </footer>

      {showPrivacyModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Privasi & Keamanan Data
              </h2>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              >
                Tutup
              </button>
            </div>

            <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <p>
                File PDF kamu diproses secara lokal di sesi aplikasi ini
                (browser + app yang kamu jalankan sendiri di perangkatmu).
              </p>
              <p>
                Data tidak dikirim ke layanan AI eksternal, analytics pihak
                ketiga, atau penyimpanan cloud dari aplikasi ini.
              </p>
              <p>
                Setelah proses selesai, hasilnya langsung kamu download sebagai
                CSV/Excel dari perangkat kamu sendiri.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Oke, ngerti
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
