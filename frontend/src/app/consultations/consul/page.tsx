"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultationConsulRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/consultations");
    }, [router]);
    return null;
}
