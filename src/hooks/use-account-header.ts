"use client";

import { useEffect, useState } from "react";
import { buildAuthHeader } from "@/lib/auth-helpers";
import { useAuth } from "@/hooks/use-auth";

export type AccountHeader = {
    username: string | null;
    email: string | null;
    avatar: string | null;
};

export function useAccountHeader(): AccountHeader {
    const { user } = useAuth();
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch("/api/account/me", { headers: { ...buildAuthHeader() }, cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setAvatar(data?.avatar || null);
            } catch { }
        }
        load();
        const onAvatarUpdated = (e: any) => {
            if (e?.detail?.url) setAvatar(e.detail.url as string);
        };
        window.addEventListener("avatarUpdated", onAvatarUpdated);
        return () => {
            cancelled = true;
            window.removeEventListener("avatarUpdated", onAvatarUpdated);
        };
    }, []);

    return {
        username: user?.username || null,
        email: user?.email || null,
        avatar,
    };
}


