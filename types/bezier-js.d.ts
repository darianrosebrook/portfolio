declare module 'bezier-js' {
  export class Bezier {
    constructor(...points: Array<{ x: number; y: number }>);
    get(t: number): { x: number; y: number };
    length(): number;
    bbox(): {
      x: { min: number; max: number };
      y: { min: number; max: number };
    };
    points: Array<{ x: number; y: number }>;
    derivative(t: number): { x: number; y: number };
    getLUT(steps: number): Array<{ x: number; y: number }>;
  }
}
