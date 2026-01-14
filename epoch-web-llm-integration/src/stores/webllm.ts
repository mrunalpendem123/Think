import { CreateMLCEngine, InitProgressCallback, MLCEngine } from "@mlc-ai/web-llm";
import { create } from 'zustand';

// Define ModelOption interface
export interface ModelOption {
    id: string;
    name: string;
    provider: string;
    size: string;
    isLocal?: boolean;
    modelRecord?: any; // To allow custom model configuration
}

export const AVAILABLE_MODELS: ModelOption[] = [
    {
        id: "Qwen2.5-3B-Instruct-q4f32_1-MLC",
        name: "Qwen 2.5 3B (Browser)",
        provider: "Alibaba",
        size: "3B",
        isLocal: false,
    },
    {
        id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        name: "Llama 3.2 3B (Browser)",
        provider: "Meta",
        size: "3B",
        isLocal: false,
    },
    {
        id: "gemma-2-2b-it-q4f32_1-MLC",
        name: "Gemma 2 2B (Browser)",
        provider: "Google",
        size: "2B",
        isLocal: false,
    },
    {
        id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        name: "Phi 3.5 Mini (Browser)",
        provider: "Microsoft",
        size: "3.8B",
        isLocal: false,
    },
    {
        id: "LiquidAI/LFM2.5-1.2B-Instruct",
        name: "LFM 2.5 1.2B Instruct (Local Python)",
        provider: "Liquid AI",
        size: "1.2B",
        isLocal: true,
    },
    {
        id: "NousResearch/Hermes-3-Llama-3.2-3B",
        name: "Writing",
        provider: "Nous Research",
        size: "3B",
        isLocal: true,
    },
    {
        id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
        name: "Mistral 7B Instruct v0.3",
        provider: "Mistral AI",
        size: "7B",
        isLocal: false,
    },
];

interface WebLLMState {
    engine: MLCEngine | null;
    currentModelId: string;
    isLoading: boolean;
    progress: string;

    loadModel: (modelId: string) => Promise<void>;
    resetEngine: () => Promise<void>;
}


// Helper to mimic WebLLM's streaming response from our API
async function* apiStreamGenerator(response: Response) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    // OpenAI format to WebLLM format bridge if needed
                    // WebLLM expects: { choices: [{ delta: { content: "..." } }] }
                    // Our local server sends OpenAI chunks, which match this structure.
                    if (json.choices && json.choices[0]?.delta) {
                        yield {
                            choices: [{
                                delta: {
                                    content: json.choices[0].delta.content
                                }
                            }]
                        };
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        }
    }
}

export const useWebLLMStore = create<WebLLMState>((set, get) => ({
    engine: null,
    currentModelId: "",
    isLoading: false,
    progress: "",

    loadModel: async (modelId: string) => {
        const { engine, currentModelId, isLoading } = get();
        if (isLoading || (engine && currentModelId === modelId)) return;

        const modelConfig = AVAILABLE_MODELS.find(m => m.id === modelId);
        // @ts-ignore
        const isLocal = modelConfig?.isLocal;

        set({ isLoading: true, currentModelId: modelId, progress: isLocal ? "Connecting to Local API..." : "Initializing WebLLM..." });

        try {
            if (engine) {
                await engine.unload();
                set({ engine: null });
            }

            if (isLocal) {
                set({ progress: "Pinging Local Python Server..." });

                // Verify connection
                try {
                    const ping = await fetch("/api/local-llm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ model: modelId, messages: [], stream: false, check_health: true })
                    });
                    if (!ping.ok) throw new Error("Local Server Unreachable");
                } catch (e) {
                    // Ignore error for now to allow trying, or throw?
                    // If we throw, the user knows it failed.
                    console.error("Local Server Ping Failed", e);
                    set({ progress: "Warning: Local Server Unreachable (Check terminal)" });
                    // We continue to set the engine to allow retry, but show warning
                }

                await new Promise(r => setTimeout(r, 500));

                // Create Local Mock Engine
                const localEngine: any = {
                    chat: {
                        completions: {
                            create: async (params: any) => {
                                const response = await fetch("/api/local-llm", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        model: modelId,
                                        messages: params.messages,
                                        temperature: params.temperature
                                    })
                                });

                                if (!response.ok) {
                                    const err = await response.text();
                                    throw new Error(`Local API Failed: ${err}`);
                                }

                                if (params.stream) {
                                    return apiStreamGenerator(response);
                                }
                                return response.json();
                            }
                        }
                    },
                    unload: async () => { console.log("Local engine unloaded"); }
                };

                set({ engine: localEngine, progress: "" });
            } else {
                const initProgressCallback: InitProgressCallback = (report) => {
                    set({ progress: report.text });
                };

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Model initialization timed out (check internet connection)")), 60000)
                );

                const engPromise = CreateMLCEngine(modelId, {
                    initProgressCallback,
                    logLevel: "INFO"
                });

                // Race between creation and timeout
                const eng = await Promise.race([engPromise, timeoutPromise]) as MLCEngine;
                set({ engine: eng });
            }
        } catch (err: any) {
            console.error("Failed to load model:", err);
            set({ progress: `Error: ${err.message}` });
            set({ engine: null }); // Ensure engine is null on error
        } finally {
            set({ isLoading: false });
        }
    },

    resetEngine: async () => {
        const { engine } = get();
        if (engine) {
            await engine.unload();
        }
        set({ engine: null, currentModelId: "", progress: "" });
        // Clear WebLLM cache if possible (requires internal access or user action)
        try {
            // Attempt to clear IndexedDB databases related to WebLLM
            const dbs = await window.indexedDB.databases();
            for (const db of dbs) {
                if (db.name?.includes("webllm") || db.name?.includes("mlc")) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            }
            console.log("Cleared WebLLM IndexedDB caches.");
        } catch (e) {
            console.error("Failed to clear cache:", e);
        }
    }
}));
