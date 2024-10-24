import { Vector } from "@objects-tracker/types";

export function getVectorAngle({ x, y }: Vector): number {
  const angleInRadians = Math.atan2(y, x);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  return (angleInDegrees + 360) % 360;
}
