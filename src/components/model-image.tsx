"use client";

type TModelImageProps = {
  providerKey: string;
  providerName: string;
  className?: string;
};

export function ModelImage({
  providerKey,
  providerName,
  className = "w-8 h-8 rounded bg-muted p-1",
}: TModelImageProps) {
  return (
    <img
      src={`https://models.dev/logos/${providerKey}.svg`}
      alt={`${providerName} logo`}
      className={className}
      onError={(e) => {
        e.currentTarget.src = "https://models.dev/logos/default.svg";
      }}
    />
  );
}
