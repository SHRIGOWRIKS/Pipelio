"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, Plus, Pencil, Trash2, Star, ExternalLink,
  CheckCircle, X, Briefcase, Upload, Loader2, File,
} from "lucide-react";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

interface ResumeVersion {
  id: string;
  name: string;
  fileUrl?: string | null;
  filePath?: string | null;
  notes?: string | null;
  isDefault: boolean;
  createdAt: string;
  _count?: { jobs: number };
}

// ── File Upload Zone ──────────────────────────────────────────────────────────
function ResumeUploadZone({
  currentFileName,
  onUploaded,
  onClear,
}: {
  currentFileName?: string;
  onUploaded: (url: string, path: string, name: string) => void;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "doc", "docx"].includes(ext || "")) {
        setError("Only PDF, DOC, DOCX files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be under 5MB.");
        return;
      }

      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/vault/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed. Try again.");
      } else {
        onUploaded(data.url, data.path, file.name);
      }
    } catch {
      setError("Upload failed. Try again or paste a URL instead.");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  if (currentFileName) {
    return (
      <div className="flex items-center gap-3 bg-[#EEF4F0] border border-[#C8DDD0] rounded-xl px-4 py-3">
        <File size={15} className="text-[#6B9E78] shrink-0" />
        <span className="text-sm font-medium text-[#4A7C59] flex-1 truncate">{currentFileName}</span>
        <CheckCircle size={14} className="text-[#6B9E78] shrink-0" />
        <button onClick={onClear} className="text-[#6B7280] hover:text-[#9B3D38] transition-colors ml-1">
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
        style={{ borderColor: dragging ? "#6B9E78" : "#E8E8E4", background: dragging ? "#EEF4F0" : "transparent" }}
      >
        {uploading
          ? <Loader2 size={20} className="text-[#6B9E78] animate-spin" />
          : <Upload size={20} className="text-[#6B7280]" />}
        <p className="text-sm font-medium text-[#1C1C1E]">
          {uploading ? "Uploading..." : "Drop resume here or click to browse"}
        </p>
        <p className="text-xs text-[#6B7280]">PDF, DOCX, DOC · Max 5MB</p>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      {error && <p className="text-xs text-[#9B3D38] mt-1.5">{error}</p>}
    </div>
  );
}

// ── Version Form ──────────────────────────────────────────────────────────────
function VersionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<ResumeVersion & { filePath?: string }>;
  onSave: (data: Partial<ResumeVersion> & { filePath?: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name:      initial?.name    || "",
    fileUrl:   initial?.fileUrl || "",
    filePath:  initial?.filePath || "",
    notes:     initial?.notes   || "",
    isDefault: initial?.isDefault || false,
  });
  // If editing and has a filePath (uploaded), show as uploaded file
  const isUploaded = !!(initial?.filePath);
  const [uploadedFileName, setUploadedFileName] = useState(
    isUploaded && initial?.fileUrl
      ? initial.fileUrl.split("/").pop()?.split("?")[0] || "Uploaded file"
      : ""
  );
  const [useUpload, setUseUpload] = useState(isUploaded);

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E4] p-5 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
          Resume Name <span className="text-[#9B3D38]">*</span>
        </label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. React Focused, Fullstack v2, PM Resume"
          className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
      </div>

      {/* File — toggle between upload and URL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Resume File
          </label>
          <div className="flex items-center gap-1 bg-[#F5F5F1] rounded-lg p-0.5">
            <button onClick={() => setUseUpload(false)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${!useUpload ? "bg-white text-[#6B9E78] shadow-sm" : "text-[#6B7280]"}`}>
              URL
            </button>
            <button onClick={() => setUseUpload(true)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${useUpload ? "bg-white text-[#6B9E78] shadow-sm" : "text-[#6B7280]"}`}>
              Upload
            </button>
          </div>
        </div>

        {useUpload ? (
          <ResumeUploadZone
            currentFileName={uploadedFileName}
            onUploaded={(url, path, name) => {
              setForm(f => ({ ...f, fileUrl: url, filePath: path }));
              setUploadedFileName(name);
            }}
            onClear={() => {
              setForm(f => ({ ...f, fileUrl: "", filePath: "" }));
              setUploadedFileName("");
            }}
          />
        ) : (
          <input value={isUploaded ? "" : form.fileUrl}
            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value, filePath: "" }))}
            placeholder="https://drive.google.com/... or Dropbox, OneDrive, etc."
            className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="e.g. Tailored for frontend roles, emphasizes React and TypeScript..."
          rows={2}
          className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B9E78] transition-colors" />
      </div>

      {/* Default */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isDefault}
          onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
          className="w-4 h-4 rounded border-[#E8E8E4] accent-[#6B9E78]" />
        <span className="text-sm text-[#6B7280]">Set as default resume</span>
      </label>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 bg-[#6B9E78] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A8A67] transition-colors disabled:opacity-50">
          {saving ? "Saving..." : <><CheckCircle size={14} />Save</>}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-[#6B7280] border border-[#E8E8E4] rounded-lg hover:bg-[#F5F5F1] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main VaultClient ──────────────────────────────────────────────────────────
export default function VaultClient() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch("/api/vault")
      .then(r => r.json())
      .then(d => { setVersions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (data: Partial<ResumeVersion> & { filePath?: string }) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setVersions(prev => {
          const updated = data.isDefault ? prev.map(v => ({ ...v, isDefault: false })) : prev;
          return [json, ...updated];
        });
        setAdding(false);
        addToast("Resume saved to vault!", "success");
      } else {
        setSaveError(json.error || "Failed to save. Try again.");
      }
    } catch {
      setSaveError("Network error. Try again.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (id: string, data: Partial<ResumeVersion> & { filePath?: string }) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setVersions(prev => {
          const list = data.isDefault ? prev.map(v => ({ ...v, isDefault: false })) : prev;
          return list.map(v => v.id === id ? { ...v, ...json } : v);
        });
        setEditingId(null);
        addToast("Resume updated!", "success");
      } else {
        setSaveError(json.error || "Failed to save. Try again.");
      }
    } catch {
      setSaveError("Network error. Try again.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume version? Jobs linked to it will be unlinked.")) return;
    const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVersions(prev => prev.filter(v => v.id !== id));
      addToast("Resume deleted", "info");
    } else {
      addToast("Failed to delete. Try again.", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/vault/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) setVersions(prev => prev.map(v => ({ ...v, isDefault: v.id === id })));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EEF4F0] rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-[#6B9E78]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">Resume Vault</h1>
            <p className="text-sm text-[#6B7280]">Upload, manage, and link resume versions to job applications</p>
          </div>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#6B9E78] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A8A67] transition-colors shadow-sm">
          <Plus size={15} />Add Resume
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-5" style={{ animation: "fadeUp 0.3s ease both" }}>
          {saveError && (
            <div className="mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-xl px-4 py-3 text-sm text-[#9B3D38]">
              {saveError}
            </div>
          )}
          <VersionForm onSave={handleAdd} onCancel={() => { setAdding(false); setSaveError(""); }} saving={saving} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C8DDD0] border-t-[#6B9E78] animate-spin" role="status" aria-label="Loading" />
        </div>
      )}

      {/* Empty state */}
      {!loading && versions.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center mb-4">
            <FileText size={28} className="text-[#6B9E78]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">No resumes yet</h3>
          <p className="text-sm text-[#6B7280] mb-6 max-w-xs">
            Upload your resume or paste a link. Link versions to job cards so you always know what you submitted.
          </p>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-[#6B9E78] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A8A67] transition-colors">
            <Plus size={15} />Add your first resume
          </button>
        </div>
      )}

      {/* Resume list */}
      <div className="space-y-3">
        {versions.map(v => (
          <div key={v.id} style={{ animation: "fadeUp 0.3s ease both" }}>
            {editingId === v.id ? (
              <div>
                {saveError && (
                  <div className="mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-xl px-4 py-3 text-sm text-[#9B3D38]">
                    {saveError}
                  </div>
                )}
                <VersionForm
                  initial={v as Partial<ResumeVersion & { filePath?: string }>}
                  onSave={data => handleEdit(v.id, data)}
                  onCancel={() => { setEditingId(null); setSaveError(""); }}
                  saving={saving}
                />
              </div>
            ) : (
              <div className={`bg-white rounded-xl border p-5 transition-all ${
                v.isDefault ? "border-[#C8DDD0] bg-[#FAFDF9]" : "border-[#E8E8E4]"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      v.isDefault ? "bg-[#EEF4F0]" : "bg-[#F5F5F1]"
                    }`}>
                      <FileText size={16} className={v.isDefault ? "text-[#6B9E78]" : "text-[#6B7280]"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-[#1C1C1E] text-sm">{v.name}</h3>
                        {v.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EEF4F0] text-[#4A7C59] border border-[#C8DDD0] px-2 py-0.5 rounded-full">
                            <Star size={9} fill="currentColor" />Default
                          </span>
                        )}
                        {(v._count?.jobs ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#6B7280] bg-[#F5F5F1] px-2 py-0.5 rounded-full">
                            <Briefcase size={9} />{v._count?.jobs} job{(v._count?.jobs ?? 0) !== 1 ? "s" : ""}
                          </span>
                        )}
                        {v.filePath && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#4A7C59] bg-[#EEF4F0] px-2 py-0.5 rounded-full">
                            <Upload size={9} />Uploaded
                          </span>
                        )}
                      </div>
                      {v.notes && <p className="text-xs text-[#6B7280] leading-relaxed mb-2">{v.notes}</p>}
                      {v.fileUrl && (
                        <a href={v.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#6B9E78] hover:underline font-medium">
                          <ExternalLink size={11} />
                          {v.filePath
                            ? decodeURIComponent(v.fileUrl.split("/").pop()?.split("?")[0]?.replace(/^\d+-/, "") || "View file")
                            : "View resume link"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!v.isDefault && (
                      <button onClick={() => handleSetDefault(v.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#6B9E78] rounded-lg hover:bg-[#EEF4F0] transition-colors" title="Set as default">
                        <Star size={14} />
                      </button>
                    )}
                    <button onClick={() => { setEditingId(v.id); setAdding(false); }}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] rounded-lg hover:bg-[#F5F5F1] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#9B3D38] rounded-lg hover:bg-[#FDF0EF] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
