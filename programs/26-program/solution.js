// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
const sleep = (ms) => 
    new Promise(resolve => setTimeout(resolve, ms));

export async function retry(
    operation, 
    {
        retries = 3,
        baseDelay = 100,
         shouldRetry = () => true
    } = {}
) {
    let lastError;

    for(let attempt = 0; attempt <= retries; attempt++) {
        try{
            return await operation(attempt);

        }catch(error) {
            lastError = error;

            if(attempt === retries || !shouldRetry(error)) {
                throw lastError;
            }

            const exponential = baseDelay * Math.pow(2, attempt);

            const jitter = Math.random() * exponential * 0.2;


            await sleep(exponential + jitter);
        }
    
    }

    throw lastError;



}