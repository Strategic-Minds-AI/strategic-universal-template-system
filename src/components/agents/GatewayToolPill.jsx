import React, { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function GatewayToolPill({ tc }) {
  const [open, setOpen] = useState(false);
  const done = ["completed", "success"].includes(tc.status);
  const failed = ["failed", "error"].includes(tc.status) || !!tc.results?.error;
  const hidden = tc.display_projection?.hide_details && tc.display_projection?.details_redacted;
  return (
    <div className="mt-1.5 text-xs">
      {!hidden && tc.image_url && <a href={tc.image_url} download="generated-logo.jpg"><Image src={tc.image_url} alt="Generated logo" fittingType="fit" className="w-48 h-48 rounded-lg mb-2 bg-background" /></a>}
      <button type="button" onClick={() => !hidden && setOpen(!open)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground" aria-expanded={hidden ? undefined : open}>
        {failed ? <X className="w-3 h-3 text-destructive" /> : done ? <Check className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
        <span className="font-mono">{tc.display_projection?.label || tc.name}</span>
        <span>{failed ? "failed" : done ? "done" : "running"}</span>
      </button>
      {!hidden && open && <div className="mt-1 ml-4">
        <code className="text-[10px] break-all">{tc.arguments_string}</code>
        <pre className="text-[10px] bg-muted p-1.5 rounded overflow-auto max-h-32 mt-0.5">{typeof tc.results === "string" ? tc.results : JSON.stringify(tc.results, null, 2)}</pre>
      </div>}
    </div>
  );
}