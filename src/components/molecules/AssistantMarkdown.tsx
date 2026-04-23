import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";

// Prose-like styling via Tailwind child selectors — keeps MessageBubble flat
// without pulling in @tailwindcss/typography.
const PROSE_CLASSES = [
  "space-y-2 break-words",
  "[&_p]:leading-relaxed",
  "[&_strong]:font-semibold [&_strong]:text-neutral-50",
  "[&_em]:italic",
  "[&_a]:text-sky-400 [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
  "[&_li>p]:inline",
  "[&_h1]:text-lg [&_h1]:font-bold",
  "[&_h2]:text-base [&_h2]:font-bold",
  "[&_h3]:text-sm [&_h3]:font-bold",
  "[&_code]:rounded [&_code]:bg-neutral-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-neutral-100",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-950 [&_pre]:p-3 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-neutral-700 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-300",
  "[&_hr]:my-3 [&_hr]:border-neutral-700",
  "[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto",
  "[&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-t [&_td]:border-neutral-700 [&_td]:px-2 [&_td]:py-1",
].join(" ");

export function AssistantMarkdown() {
  return <MarkdownTextPrimitive className={PROSE_CLASSES} remarkPlugins={[remarkGfm]} smooth />;
}
