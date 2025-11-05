"use client";

import { useEffect, useRef, useState } from "react";

export function useMountState() {
  const [mounted, setMounted] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { mounted, isMountedRef };
}
