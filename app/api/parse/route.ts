import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import {
  parseStatementText,
  rowsToCsv,
  type StatementRow,
} from "@/lib/statement-parser";

export const runtime = "nodejs";

function toErrorMessage(caught: unknown): string {
  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return "Unknown error";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParseFn = pdfParseModule.default as (
    data: Buffer | Uint8Array,
  ) => Promise<{ text: string }>;

  const parsed = await pdfParseFn(buffer);
  return parsed.text;
}

function rowsToXlsxBase64(rows: StatementRow[]): string {
  const workbook = XLSX.utils.book_new();

  const rowsByYear = new Map<string, StatementRow[]>();

  for (const row of rows) {
    const yearMatch = row.tanggalWaktu.match(/\b(19|20)\d{2}\b/);
    const yearKey = yearMatch?.[0] ?? "Lainnya";

    const existing = rowsByYear.get(yearKey);
    if (existing) {
      existing.push(row);
    } else {
      rowsByYear.set(yearKey, [row]);
    }
  }

  const sortedYears = [...rowsByYear.keys()].sort((left, right) => {
    if (left === "Lainnya") {
      return 1;
    }
    if (right === "Lainnya") {
      return -1;
    }

    return Number(left) - Number(right);
  });

  for (const year of sortedYears) {
    const yearRows = rowsByYear.get(year) ?? [];

    const exportRows = yearRows.map((row) => ({
      "Tanggal & Waktu": row.tanggalWaktu,
      "Sumber/Tujuan": row.sumberTujuan,
      "Rincian Transaksi": row.rincianTransaksi,
      Catatan: row.catatan,
      Jumlah: row.jumlah,
      Saldo: row.saldo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, year.slice(0, 31));
  }

  const xlsxBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  }) as Buffer;

  return xlsxBuffer.toString("base64");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File PDF tidak ditemukan." },
        { status: 400 },
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Format file harus PDF." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractPdfText(buffer);
    const rows = parseStatementText(text);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Data transaksi tidak terdeteksi. Coba PDF lain atau sesuaikan parser.",
        },
        { status: 422 },
      );
    }

    const csv = rowsToCsv(rows);
    const xlsxBase64 = rowsToXlsxBase64(rows);

    return NextResponse.json({
      rowCount: rows.length,
      rows,
      csv,
      xlsxBase64,
    });
  } catch (caught) {
    const message = toErrorMessage(caught);
    const knownPdfError =
      /password|encrypted|invalid|corrupt|malformed|unable to parse|bad xref/i.test(
        message,
      );

    return NextResponse.json(
      {
        error: knownPdfError
          ? `PDF tidak bisa dibaca: ${message}`
          : `Gagal memproses PDF: ${message}`,
      },
      { status: 500 },
    );
  }
}
