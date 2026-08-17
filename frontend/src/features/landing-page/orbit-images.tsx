"use client";

import {
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";

type OrbitShape = "ellipse" | "circle" | "custom";

interface OrbitImagesProps {
  images?: ReactNode[];
  shape?: OrbitShape;
  customPath?: string;
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  rotation?: number;
  duration?: number;
  itemSize?: number;
  direction?: "normal" | "reverse";
  fill?: boolean;
  width?: number | "100%";
  height?: number | "auto";
  className?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathDasharray?: string; // Added for the dashed line effect
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  paused?: boolean;
  centerContent?: ReactNode;
  responsive?: boolean;
}

interface OrbitItemProps {
  item: ReactNode;
  index: number;
  totalItems: number;
  path: string;
  itemSize: number;
  rotation: number;
  progress: MotionValue<number>;
  fill: boolean;
}

function generateEllipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx: number, cy: number, r: number): string {
  return generateEllipsePath(cx, cy, r, r);
}

function OrbitItem({
  item,
  index,
  totalItems,
  path,
  itemSize,
  rotation,
  progress,
  fill,
}: OrbitItemProps) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetDistance = useTransform(progress, (p: number) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div
      className="absolute flex select-none items-center justify-center will-change-transform hover:z-50"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance,
      }}
    >
      {/* Counter-rotate the child so the text stays upright despite the parent container's rotation */}
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  shape = "ellipse",
  customPath,
  baseWidth = 1400,
  radiusX = 600,
  radiusY = 250,
  radius = 300,
  rotation = -15, // Matched the tilt from your video
  duration = 60, // Slowed down for a smoother orbit
  itemSize = 64,
  direction = "normal",
  fill = true,
  width = 10,
  height = 10,
  className = "",
  showPath = true,
  pathColor = "rgba(150, 150, 150, 0.3)",
  pathWidth = 2,
  pathDasharray = "6 6", // Dotted path
  easing = "linear",
  paused = false,
  centerContent,
  responsive = false,
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case "circle":
        return generateCirclePath(designCenterX, designCenterY, radius);
      case "ellipse":
        return generateEllipsePath(
          designCenterX,
          designCenterY,
          radiusX,
          radiusY,
        );
      case "custom":
        return (
          customPath || generateCirclePath(designCenterX, designCenterY, radius)
        );
      default:
        return generateEllipsePath(
          designCenterX,
          designCenterY,
          radiusX,
          radiusY,
        );
    }
  }, [
    shape,
    customPath,
    designCenterX,
    designCenterY,
    radiusX,
    radiusY,
    radius,
  ]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;
    const controls = animate(progress, direction === "reverse" ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [progress, duration, easing, direction, paused]);

  const containerWidth = responsive
    ? "100%"
    : typeof width === "number"
      ? width
      : "100%";
  const containerHeight = responsive
    ? "auto"
    : typeof height === "number"
      ? height
      : typeof width === "number"
        ? width
        : "auto";

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? "3 / 1" : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className={
          responsive ? "absolute left-1/2 top-1/2" : "relative h-full w-full"
        }
        style={{
          width: responsive ? baseWidth : "100%",
          height: responsive ? baseWidth : "100%",
          transform:
            responsive && scale !== null
              ? `translate(-50%, -50%) scale(${scale})`
              : undefined,
          visibility: responsive && scale === null ? "hidden" : undefined,
          transformOrigin: "center center",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="pointer-events-none absolute inset-0"
            >
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / (scale ?? 1)}
                strokeDasharray={pathDasharray}
              />
            </svg>
          )}

          {images.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={images.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              progress={progress}
              fill={fill}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}
