"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForumSmsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/forum");
    }, [router]);
    return null;
}
