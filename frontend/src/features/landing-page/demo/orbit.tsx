"use client";

import { useLayoutEffect, useRef, useState, ReactNode } from "react";

interface OrbitProps {
  images: ReactNode[];
  baseWidth: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  itemSize: number;
  className?: string;
  /** Fires with the current responsive scale factor (null until measured). */
  onScaleChange?: (scale: number | null) => void;
}

function generateEllipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

export default function Orbit({
  images,
  baseWidth,
  radiusX,
  radiusY,
  rotation,
  itemSize,
  className = "",
  onScaleChange,
}: OrbitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const center = baseWidth / 2;
  const path = generateEllipsePath(center, center, radiusX, radiusY);

  // Design-space bounds of the orbit, padded by itemSize since items are
  // centered on the path and stick out past it in every direction. The
  // orbit is centered within the baseWidth×baseWidth canvas, so there's an
  // equal empty margin above and below it that the tightly-cropped
  // container needs to cancel out via a negative top offset.
  const orbitBoundsHeight = radiusY * 2 + itemSize;
  const orbitMarginY = (baseWidth - orbitBoundsHeight) / 2;

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const nextScale = containerRef.current.clientWidth / baseWidth;
      setScale(nextScale);
      onScaleChange?.(nextScale);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [baseWidth, onScaleChange]);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full ${className}`}
      style={{ height: scale !== null ? orbitBoundsHeight * scale : 0 }}
      aria-hidden="true"
    >
      <div
        className="relative"
        style={{
          width: baseWidth,
          height: baseWidth,
          top: scale !== null ? -orbitMarginY * scale : undefined,
          transform: scale !== null ? `scale(${scale})` : undefined,
          visibility: scale === null ? "hidden" : undefined,
          transformOrigin: "top left",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${baseWidth} ${baseWidth}`}
            className="pointer-events-none absolute inset-0"
          >
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth={2 / (scale ?? 1)}
              strokeDasharray="6 6"
            />
          </svg>

          {images.map((item, index) => (
            <div
              key={index}
              className="absolute flex select-none items-center justify-center hover:z-50"
              style={{
                width: itemSize,
                height: itemSize,
                offsetPath: `path("${path}")`,
                offsetRotate: "0deg",
                offsetAnchor: "center center",
                offsetDistance: `${(index / images.length) * 100}%`,
              }}
            >
              {/* Counter-rotate the child so the text stays upright despite the parent container's rotation */}
              <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
