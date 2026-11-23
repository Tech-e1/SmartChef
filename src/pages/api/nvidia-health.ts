import type { NextApiRequest, NextApiResponse } from 'next';
import { OLLAMA_CONFIG } from '@/lib/prompts';

/**
 * Diagnostic endpoint to check whether the local Ollama server is reachable.
 * Hit GET /api/nvidia-health to get a detailed connectivity report.
 * (Kept at same path for backward compatibility.)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const report: Record<string, any> = {
        timestamp: new Date().toISOString(),
        endpoint: OLLAMA_CONFIG.endpoint,
        model: OLLAMA_CONFIG.model,
        provider: 'Ollama (local/offline)',
    };

    const { hostname, port } = new URL(OLLAMA_CONFIG.endpoint);

    // Step 1: DNS resolution
    try {
        const dns = await import('dns');
        const addresses = await dns.promises.lookup(hostname, { all: true });
        report.dns = { hostname, resolved: true, addresses: addresses.map((a) => a.address) };
    } catch (dnsError: any) {
        report.dns = { hostname, resolved: false, error: dnsError.message };
        return res.status(502).json({ ...report, ok: false, error: 'DNS resolution failed' });
    }

    // Step 2: HTTP reachability via Ollama /api/tags endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const startTime = Date.now();
    try {
        const response = await fetch(`${OLLAMA_CONFIG.endpoint}/api/tags`, {
            method: 'GET',
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

        if (response.ok) {
            try {
                const tags = JSON.parse(bodyText);
                const models = tags.models?.map((m: any) => m.name) || [];
                report.models = models;
                report.modelAvailable = models.includes(OLLAMA_CONFIG.model);
            } catch {
                // body wasn't JSON, that's ok
            }
        }

        return res.status(200).json({
            ...report,
            ok: response.ok,
            verdict: response.ok
                ? `SUCCESS: Reached local Ollama at ${OLLAMA_CONFIG.endpoint}.`
                : `REACHED Ollama but got HTTP ${response.status}.`,
        });
    } catch (fetchError: any) {
        const duration = Date.now() - startTime;
        report.http = {
            reached: false,
            durationMs: duration,
            errorName: fetchError.name,
            errorMessage: fetchError.message,
        };
        return res.status(502).json({
            ...report,
            ok: false,
            verdict: fetchError.name === 'AbortError'
                ? `TIMEOUT: No response from Ollama within 10s at ${OLLAMA_CONFIG.endpoint}. Is Ollama running?`
                : `FAILED: Could not connect to Ollama at ${OLLAMA_CONFIG.endpoint}.`,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}