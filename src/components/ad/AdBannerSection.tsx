"use client";

import { useState, useEffect } from "react";
import type { AdBanner } from "@/data/type";
import { shuffle } from "@/util/shuffle";
import AdBannerGrid from "@/components/ad/AdBannerGrid";

export default function AdBannerSection() {
  const [banners, setBanners] = useState<AdBanner[]>([]);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/ads");
      const data: AdBanner[] = await res.json();
      const long = shuffle(data.filter((b) => b.type === "long"));
      const short = shuffle(data.filter((b) => b.type === "short"));
      setBanners([...long, ...short]);
    }
    init();
  }, []);

  return <AdBannerGrid banners={banners} />;
}
