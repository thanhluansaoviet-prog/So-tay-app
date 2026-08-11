import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, StickyNote } from "lucide-react";

const PAPER = "#F7F3E8";
const INK = "#2B2620";
const RUST = "#B5502E";
const LINE = "#DDD3BE";
const MUTED = "#8A8070";

const COLORS = ["#F7F3E8", "#F5E6D3", "#E8EEE3", "#EDE3EE", "#E3EAF0"];
const STORAGE_KEY = "so-tay-notes";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showList, setShowList] = useState(true);

  // Load notes from local storage (persists on the device)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotes(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      }
    } catch (e) {
      console.error("Không thể tải ghi chú:", e);
    }
    setLoaded(true);
  }, []);

  // Persist notes whenever they change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error("Không thể lưu ghi chú:", e);
    }
  }, [notes, loaded]);

  const createNote = () => {
    const note = {
      id: uid(),
      title: "",
      body: "",
      color: COLORS[0],
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setShowList(false);
  };

  const updateNote = (id, patch) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setShowList(true);
    }
  };

  const filtered = notes
    .filter((n) => {
      const q = query.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const active = notes.find((n) => n.id === activeId);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return (
      d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Iowan Old Style', serif",
        background: PAPER,
        minHeight: "100vh",
        color: INK,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        textarea, input { font-family: 'Georgia', serif; }
        textarea:focus, input:focus { outline: none; }
        .note-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .note-card:active { transform: scale(0.98); }
        .icon-btn { transition: background 0.15s ease, transform 0.1s ease; }
        .icon-btn:active { transform: scale(0.92); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${LINE}; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", flex: 1, minHeight: "100vh" }}>
        {/* Sidebar / List */}
        <div
          style={{
            width: "100%",
            display: showList ? "flex" : "none",
            flexDirection: "column",
            background: PAPER,
          }}
        >
          <div style={{ padding: "20px 20px 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h1
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: INK,
                }}
              >
                Sổ tay
              </h1>
              <span style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>
                {notes.length} ghi chú
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: `1px solid ${LINE}`,
                borderRadius: 10,
                padding: "9px 12px",
              }}
            >
              <Search size={16} color={MUTED} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm ghi chú..."
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: 14,
                  color: INK,
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 100px" }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 60, color: MUTED }}>
                <StickyNote size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontStyle: "italic" }}>
                  {notes.length === 0
                    ? "Chưa có ghi chú nào. Hãy tạo cái đầu tiên."
                    : "Không tìm thấy ghi chú nào."}
                </p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className="note-card"
                  onClick={() => {
                    setActiveId(n.id);
                    setShowList(false);
                  }}
                  style={{
                    background: n.color || COLORS[0],
                    border: `1px solid ${LINE}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: INK,
                      }}
                    >
                      {n.title || "Không có tiêu đề"}
                    </h3>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(n.id);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 6,
                        color: MUTED,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color: "#5c5546",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.body || "Chưa có nội dung..."}
                  </p>
                  <span style={{ fontSize: 11, color: MUTED, marginTop: 8, display: "block" }}>
                    {formatDate(n.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={createNote}
            className="icon-btn"
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: RUST,
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(181,80,46,0.35)",
            }}
            aria-label="Tạo ghi chú mới"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Editor */}
        {!showList && active && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: active.color || PAPER,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: `1px solid ${LINE}`,
              }}
            >
              <button
                onClick={() => setShowList(true)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: RUST,
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: "6px 4px",
                }}
              >
                ← Tất cả ghi chú
              </button>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateNote(active.id, { color: c })}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: c,
                      border: active.color === c ? `2px solid ${INK}` : `1px solid ${LINE}`,
                      cursor: "pointer",
                    }}
                    aria-label={`Chọn màu ${c}`}
                  />
                ))}
                <button
                  onClick={() => deleteNote(active.id)}
                  className="icon-btn"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: MUTED,
                    cursor: "pointer",
                    marginLeft: 8,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
              <input
                value={active.title}
                onChange={(e) => updateNote(active.id, { title: e.target.value })}
                placeholder="Tiêu đề"
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: 26,
                  fontWeight: 700,
                  color: INK,
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 18, fontStyle: "italic" }}>
                Sửa lần cuối: {formatDate(active.updatedAt)}
              </div>
              <textarea
                value={active.body}
                onChange={(e) => updateNote(active.id, { body: e.target.value })}
                placeholder="Bắt đầu viết..."
                style={{
                  width: "100%",
                  minHeight: "50vh",
                  border: "none",
                  background: "transparent",
                  resize: "none",
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "#3a352b",
                }}
              />
            </div>
          </div>
        )}

        {!showList && !active && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>
            Chọn hoặc tạo một ghi chú
          </div>
        )}
      </div>
    </div>
  );
}
