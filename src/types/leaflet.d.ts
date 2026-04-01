declare module "leaflet" {
  export type LatLngExpression = unknown;
  export type LeafletMouseEvent = unknown;

  export interface Map {
    setView: (...args: unknown[]) => unknown;
    getZoom: (...args: unknown[]) => unknown;
    on: (...args: unknown[]) => unknown;
    remove: (...args: unknown[]) => unknown;
    invalidateSize: (...args: unknown[]) => unknown;
  }

  export interface CircleMarker {
    setLatLng: (...args: unknown[]) => unknown;
    addTo: (...args: unknown[]) => unknown;
  }

  export function map(...args: unknown[]): Map;
  export function tileLayer(...args: unknown[]): { addTo: (...args: unknown[]) => unknown };
  export function circleMarker(...args: unknown[]): CircleMarker;
}

