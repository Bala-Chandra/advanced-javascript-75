// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export async function fetchWithTimeout( url, timeoutMs, externalAbortSignal ) {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Timeout")), timeoutMs);

    const abortFromOutside = () => 
        controller.abort(externalAbortSignal?.reason || new Error("Aborted from outside"));

    externalAbortSignal?.addEventListener(
        "abort",
         abortFromOutside,
        { once: true }
    );

    try{
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
        externalAbortSignal?.removeEventListener(
            "abort", 
            abortFromOutside
        );
    }
    
}