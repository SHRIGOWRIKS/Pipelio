import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function parsePDF(buffer: Buffer): Promise<string> {
  // Use pdfjs-dist in legacy Node.js mode
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  } as any);

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = "";

    if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");

    } else if (fileName.endsWith(".pdf")) {
      try {
        text = await parsePDF(buffer);
      } catch (err) {
        console.error("PDF parse error:", err);
        return NextResponse.json(
          { error: "Could not read this PDF. Try a different PDF or paste the text manually." },
          { status: 422 }
        );
      }

    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } catch (err) {
        console.error("DOCX parse error:", err);
        return NextResponse.json(
          { error: "Could not read this DOCX. Try pasting the text manually." },
          { status: 422 }
        );
      }

    } else {
      return NextResponse.json(
        { error: "Unsupported format. Upload PDF, DOCX, DOC, or TXT." },
        { status: 400 }
      );
    }

    // Clean up whitespace
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{3,}/g, " ")
      .trim();

    if (!text || text.length < 30) {
      return NextResponse.json(
        { error: "Could not extract text. The file may be image-based or protected. Try pasting the text manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, charCount: text.length });

  } catch (error) {
    console.error("File parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse file. Try pasting the text manually." },
      { status: 500 }
    );
  }
}
