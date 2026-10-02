import React from "react";
import ReactMarkdown from "react-markdown";
import GatewayToolPill from "@/components/agents/GatewayToolPill";

export default function GatewayMessage({ m }) {
  const isUser = m.role === "user";
  return <div className={isUser ? "flex justify-end" : "flex justify-start"}>
    <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
      {m.content && (isUser ? <p className="text-sm whitespace-pre-wrap">{m.content}</p> : <ReactMarkdown className="text-sm prose prose-sm max-w-none">{m.content}</ReactMarkdown>)}
      {m.tool_calls?.map((tc, i) => <GatewayToolPill key={i} tc={tc} />)}
    </div>
  </div>;
}