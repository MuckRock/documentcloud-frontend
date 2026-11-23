/**
 *  Normalize an angle to the 0-360 degree range
 */
export const normalizeAngle = (angle: number) => {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
};
