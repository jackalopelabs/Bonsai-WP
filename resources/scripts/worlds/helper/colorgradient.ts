import { Color, ColorRepresentation } from "three";

export type ColorGradientOptions = (
  | [number, ColorRepresentation]
  | { position: number; color: ColorRepresentation }
)[];

export class ColorGradient {
  private stops: { position: number; color: Color }[] = [];

  constructor(options: ColorGradientOptions = []) {
    for (const stop of options) {
      if (Array.isArray(stop)) {
        this.addStop(stop[0], stop[1]);
      } else {
        this.addStop(stop.position, stop.color);
      }
    }
  }

  addStop(position: number, color: ColorRepresentation) {
    this.stops.push({
      position,
      color: new Color(color),
    });

    // Sort stops by position
    this.stops.sort((a, b) => a.position - b.position);
  }

  get(position: number) {
    if (this.stops.length === 0) {
      return new Color();
    }

    if (this.stops.length === 1) {
      return this.stops[0].color.clone();
    }

    // Find the two stops to interpolate between
    let lowerStop = this.stops[0];
    let upperStop = this.stops[this.stops.length - 1];

    for (let i = 0; i < this.stops.length - 1; i++) {
      if (
        position >= this.stops[i].position &&
        position <= this.stops[i + 1].position
      ) {
        lowerStop = this.stops[i];
        upperStop = this.stops[i + 1];
        break;
      }
    }

    // If position is outside the range, clamp to the nearest stop
    if (position <= lowerStop.position) {
      return lowerStop.color.clone();
    }

    if (position >= upperStop.position) {
      return upperStop.color.clone();
    }

    // Interpolate between the two stops
    const t =
      (position - lowerStop.position) /
      (upperStop.position - lowerStop.position);
    return new Color().lerpColors(lowerStop.color, upperStop.color, t);
  }
} 