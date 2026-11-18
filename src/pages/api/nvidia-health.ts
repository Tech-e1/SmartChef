import type { NextApiRequest, NextApiResponse } from 'next';
import { NVIDIA_CONFIG } from '@/lib/prompts';

/**
 * Diagnostic endpoint to prove whether the app can reach the NVIDIA API server.
 * Hit GET /api/nvidia-health to get a detailed connectivity report.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const report: Record<string, any> = {
        timestamp: new Date().toISOString(),
        baseUrl: NVIDIA_CONFIG.baseUrl,
        model: NVIDIA_CONFIG.model,
        apiKeyConfigured: Boolean(NVIDIA_CONFIG.apiKey),
        apiKeyPrefix: NVIDIA_CONFIG.apiKey ? `${NVIDIA_CONFIG.apiKey.slice(0, 6)}...` : null,
    };

    if (!NVIDIA_CONFIG.apiKey) {
        return res.status(500).json({ ...report, ok: false, error: 'NVIDIA_API_KEY is not configured' });
    }

    // Step 1: DNS resolution
    const { hostname } = new URL(NVIDIA_CONFIG.baseUrl);
    try {
        const dns = await import('dns');
        const addresses = await dns.promises.lookup(hostname, { all: true });
        report.dns = { hostname, resolved: true, addresses: addresses.map((a) => a.address) };
    } catch (dnsError: any) {
        report.dns = { hostname, resolved: false, error: dnsError.message };
        return res.status(502).json({ ...report, ok: false, error: 'DNS resolution failed' });
    }

    // Step 2: TCP/HTTP reachability via a minimal request to the models endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const startTime = Date.now();
    try {
        const response = await fetch(`${NVIDIA_CONFIG.baseUrl}/models`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${NVIDIA_CONFIG.apiKey}` },
            signal: controller.signal,
        });
        const duration = Date.now() - startTime;
        const bodyText = await response.text();
        report.http = {
            reached: true,
            status: response.status,
            statusText: response.statusText,
            durationMs: duration,
            bodyPreview: bodyText.slice(0, 300),
        };
        return res.status(200).json({
            ...report,
            ok: response.ok,
            verdict: response.ok
                ? 'SUCCESS: Reached NVIDIA API and authenticated.'
                : `REACHED NVIDIA API but got HTTP ${response.status}. (Server is reachable; check API key/model.)`,
        });
    } catch (fetchError: any) {
        const duration = Date.now() - startTime;
        report.http = {
            reached: false,
            durationMs: duration,
            errorName: fetchError.name,
            errorMessage: fetchError.message,
            errorCause: fetchError.cause ? String(fetchError.cause) : undefined,
        };
        return res.status(502).json({
            ...report,
            ok: false,
            verdict: fetchError.name === 'AbortError'
                ? 'TIMEOUT: No response from NVIDIA within 15s. The server is unreachable or hanging.'
                : 'FAILED: Could not connect to NVIDIA API server.',
        });
    } finally {
        clearTimeout(timeoutId);
    }
}
