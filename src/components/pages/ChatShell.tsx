import { useCapabilities } from "@/hooks/useCapabilities.ts";
import { useDocumentLang } from "@/hooks/useDocumentLang.ts";
import { useLlmRuntime } from "@/hooks/useLlmRuntime.ts";
import { useT } from "@/lib/i18n/index.ts";
import { useLlmStore } from "@/lib/llm-store.ts";
import { preloadFileset } from "@/lib/mediapipe-llm.ts";
import { MODEL_CATALOG, type ModelId } from "@/lib/model-catalog.ts";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useEffect, useState } from "react";
import { Tagline } from "../atoms/Tagline.tsx";
import {
  ChatThread,
  ConversationSidebar,
  DownloadProgress,
  Header,
  InstallPrompt,
  KeyFacts,
  ModelPicker,
  SettingsDialog,
} from "../organisms/index.ts";
import { ChatLayout } from "../templates/ChatLayout.tsx";

export function ChatShell() {
  useDocumentLang();
  const t = useT();
  const runtime = useLlmRuntime();
  const modelId = useLlmStore((s) => s.modelId);
  const state = useLlmStore((s) => s.state);
  const stats = useLlmStore((s) => s.stats);
  const load = useLlmStore((s) => s.load);
  const cancel = useLlmStore((s) => s.cancel);
  const unload = useLlmStore((s) => s.unload);
  const { caps, cached, refresh } = useCapabilities();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [picker, setPicker] = useState<ModelId>(modelId);

  useEffect(() => {
    preloadFileset();
  }, []);

  useEffect(() => {
    if (state.kind === "ready") refresh();
  }, [state.kind, refresh]);

  const ready = state.kind === "ready";
  const meta = MODEL_CATALOG[modelId];

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatLayout
        header={
          <Header
            modelLabel={meta.label}
            ready={ready}
            loadMs={stats?.durationMs}
            loadFromCache={stats?.fromCache}
            onToggleDrawer={() => setDrawerOpen((v) => !v)}
            onSwap={() => void unload()}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        }
        sidebar={ready ? <ConversationSidebar /> : undefined}
        drawer={ready ? <ConversationSidebar /> : undefined}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        overlay={
          <>
            <InstallPrompt />
            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </>
        }
      >
        {!ready ? (
          <div className="flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
              <h1 className="text-center text-xl font-medium leading-snug tracking-tight text-neutral-100 text-balance sm:text-2xl">
                {t("hero.headline")}
              </h1>
              {caps && cached && state.kind === "idle" && (
                <ModelPicker selectedId={picker} onSelect={setPicker} caps={caps} cached={cached} />
              )}
              <DownloadProgress
                state={state}
                modelLabel={MODEL_CATALOG[state.kind === "idle" ? picker : modelId].label}
                onStart={() => void load(picker)}
                onCancel={cancel}
              />
            </div>
            <footer className="flex flex-col gap-5 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <KeyFacts className="mx-auto w-full max-w-sm" />
              <Tagline />
            </footer>
          </div>
        ) : (
          <ChatThread disabled={!ready} />
        )}
      </ChatLayout>
    </AssistantRuntimeProvider>
  );
}
