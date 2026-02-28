"use client";

import { useState, useEffect } from "react";
import type { AdBanner } from "@/data/type";
import { shuffle } from "@/util/shuffle";
import AdBannerGrid from "@/components/AdBannerGrid";

export default function AdBannerSection() {
  const [banners, setBanners] = useState<AdBanner[]>([]);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data: AdBanner[]) => setBanners(shuffle(data)));
  }, []);

  return <AdBannerGrid banners={banners} />;
}
