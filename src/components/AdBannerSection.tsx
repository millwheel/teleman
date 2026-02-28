"use client";

import { useState, useEffect } from "react";
import type { AdBanner } from "@/data/type";
import { shuffle } from "@/util/shuffle";
import AdBannerGrid from "@/components/AdBannerGrid";

export default function AdBannerSection() {
  const [banners, setBanners] = useState<AdBanner[]>([]);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/ads");
      const data: AdBanner[] = await res.json();
      setBanners(shuffle(data));
    }
    init();
  }, []);

  return <AdBannerGrid banners={banners} />;
}
