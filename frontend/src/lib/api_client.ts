// src/lib/api-client.ts
import { fetchAuthSession } from "@aws-amplify/auth";

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL; // e.g. https://abc123.execute-api.us-east-1.amazonaws.com/prod

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    // Get the Cognito JWT — Amplify handles refresh automatically
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const url = `${API_BASE_URL}${path}`;
    console.log("url = " + url);

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `API error ${res.status}`);
    }

    return res.json();
}