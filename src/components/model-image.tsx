"use client";

import Image from "next/image";
import { useState } from "react";

type TModelImageProps = {
  providerKey: string;
  providerName: string;
  className?: string;
};

export function ModelImage({
  providerKey,
  providerName,
  className = "size-8",
}: TModelImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      src={
        hasError
          ? "https://models.dev/logos/default.svg"
          : `https://models.dev/logos/${providerKey}.svg`
      }
      alt={`${providerName} logo`}
      width={32}
      height={32}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
