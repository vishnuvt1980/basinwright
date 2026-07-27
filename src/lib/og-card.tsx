import { ImageResponse } from "next/og";

/* ---------------------------------------------------------------------------
   The shared Open Graph card.

   1200×630 is the size WhatsApp, X, Facebook, LinkedIn and Slack all render
   large; anything smaller falls back to a thumbnail beside the text.

   Rendered by satori, which supports a subset of CSS: flexbox only (no grid),
   inline styles only, and every element with more than one child needs an
   explicit `display: flex`. The layout below is written to those rules — it is
   plainer than the site deliberately, because a preview card is read at
   thumbnail size in a chat list.
--------------------------------------------------------------------------- */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/// The dark theme's tokens, as literals — satori has no CSS variables.
const INK = "#ffffff";
const INK_2 = "#c8d0dc";
const INK_3 = "#97a3b5";
const CANVAS = "#0e1726";
const LINE = "#2a3a54";
const ACCENT = "#6cb8f6";

/// The mark's three lit dots, in the substrate's own order: governed, proven,
/// yours. Mirrors LIT/UNLIT in components/site/site-header.tsx.
const MARK_GRID = "#45506b";
const LIT: Record<string, string> = {
  "1-0": "#6bb8f5", // compute
  "2-1": "#40e6c7", // data
  "0-2": "#9ef259", // intelligence
};

function Mark({ size = 34 }: { size?: number }) {
  const dot = size / 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: size, height: size }}>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {[0, 1, 2].map((col) => {
            const lit = LIT[`${row}-${col}`];
            return (
              <div
                key={col}
                style={{
                  width: lit ? dot : dot * 0.75,
                  height: lit ? dot : dot * 0.75,
                  borderRadius: size,
                  background: lit ?? MARK_GRID,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/// Long titles have to shrink or they overflow the card. Three steps is enough
/// — the corpus has nothing longer than about 90 characters.
function titleSize(title: string) {
  if (title.length > 78) return 46;
  if (title.length > 52) return 54;
  return 64;
}

const clamp = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

export function ogCard({
  eyebrow,
  title,
  description,
  meta,
  siteName = "BasinWright",
}: {
  /// Collection or section label, above the title.
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  /// The footer line: author, date, read time — already joined.
  meta?: string | null;
  siteName?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: CANVAS,
          padding: "64px 72px",
          // Segoe is a Windows face and is not present on the render host;
          // satori falls back to its bundled sans, which is close enough at
          // this size and needs no font file shipped in the image.
          fontFamily: "sans-serif",
          color: INK,
        }}
      >
        {/* The accent rail, so a card is recognisable at thumbnail size. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: ACCENT,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Mark />
            <div style={{ display: "flex", marginLeft: 14, fontSize: 26, color: INK }}>
              {siteName}
            </div>
          </div>

          {eyebrow ? (
            <div
              style={{
                display: "flex",
                border: `1px solid ${LINE}`,
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 20,
                color: ACCENT,
              }}
            >
              {clamp(eyebrow, 34)}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              lineHeight: 1.14,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            {clamp(title, 110)}
          </div>

          {description ? (
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 26,
                lineHeight: 1.4,
                color: INK_2,
                maxWidth: 940,
              }}
            >
              {clamp(description, 150)}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 26,
            fontSize: 22,
            color: INK_3,
          }}
        >
          <div style={{ display: "flex" }}>{meta ? clamp(meta, 72) : "basinwright.com"}</div>
          {meta ? <div style={{ display: "flex" }}>basinwright.com</div> : null}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
