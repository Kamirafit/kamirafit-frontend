const configuredDelay = Number(process.env.NEXT_PUBLIC_MOCK_API_DELAY_MS);

export const MOCK_API_DELAY_MS =
  Number.isFinite(configuredDelay) && configuredDelay >= 0 ? configuredDelay : 400;

export function simulateNetworkLatency(delayMs = MOCK_API_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
