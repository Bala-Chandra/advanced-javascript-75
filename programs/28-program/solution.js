// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function createLatestRunner() {
    let requestId = 0;

    return async function run(operation) {
        const myId = requestId++;
        
        const result = await operation();

        if(myId !== requestId) {

            return {
                stale: true,
                value: result       
            }

        
        }

        return {
            stale: false,
            value: result
        }
    }
}
