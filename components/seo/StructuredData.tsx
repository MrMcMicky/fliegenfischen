type JsonLd =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | null
  | undefined;

export function StructuredData({ data }: { data: JsonLd }) {
  if (!data) {
    return null;
  }

  const entries = Array.isArray(data) ? data : [data];

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
