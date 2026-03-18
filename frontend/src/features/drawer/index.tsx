import BaseDrawer from "@/features/drawer/components/base";
import {
  FloatingDrawerProps,
  MorphingDrawerProps,
  StandardDrawerProps,
} from "@/features/drawer/props";

export function StandardDrawer({
  children,
  ...props
}: Omit<StandardDrawerProps, "_type">) {
  return (
    <BaseDrawer _type="standard" {...props}>
      {children}
    </BaseDrawer>
  );
}

export function MorphingDrawer({
  children,
  ...props
}: Omit<MorphingDrawerProps, "_type">) {
  return (
    <BaseDrawer _type="morphing" {...props}>
      {children}
    </BaseDrawer>
  );
}

export function FloatingDrawer({
  children,
  ...props
}: Omit<FloatingDrawerProps, "_type">) {
  return (
    <BaseDrawer _type="floating" {...props}>
      {children}
    </BaseDrawer>
  );
}
