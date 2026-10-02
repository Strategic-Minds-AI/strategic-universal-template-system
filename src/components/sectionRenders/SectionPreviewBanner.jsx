import React, { useState } from "react";
import { Eye, X } from "lucide-react";

/**
 * Collapsible preview banner — sits at the top of a section page and shows
 * a fresh purpose-built visual render of what the page does.
 * Pass any section render component as `render`.
 */
export default function SectionPreviewBanner({ render: Render, label = "Preview", height = 260 }) {
  const [open, setOpen] = useState(false);
  if (!Render) return null;
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        {open ? "Hide preview" : "Show visual preview"}
      </button>
      {open && (
        <div className="mt-2 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shadow"
          >
            <X className="w-3 h-3" />
          </button>
          <Render height={height} />
        </div>
      )}
    </div>
  );
}