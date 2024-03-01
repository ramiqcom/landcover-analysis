import ee from '@google/earthengine';
import { MapId, VisObject } from '../module/global';

/**
 * Function to authenticate EE
 * @returns
 */
export function authenticate(): Promise<void> {
  const key = JSON.parse(process.env.EE_KEY);
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      key,
      () =>
        ee.initialize(
          null,
          null,
          () => resolve(),
          (error: string) => reject(new Error(error))
        ),
      (error: string) => reject(new Error(error))
    );
  });
}

/**
 * Function evaluate ee object to readable object
 * @param element
 * @returns
 */
export function evaluate(element: ee<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    element.evaluate((data: any, error: any) => (error ? reject(new Error(error)) : resolve(data)));
  });
}

/**
 * Function to get tile url from ee object
 * @param data
 * @param vis
 * @returns
 */
export function getMapId(
  data: ee.Image | ee.ImageCollection | ee.FeatureCollection | ee.Geometry,
  vis: VisObject | {}
): Promise<MapId> {
  return new Promise((resolve, reject) => {
    data.getMapId(vis, (object: MapId, error: string) =>
      error ? reject(new Error(error)) : resolve(object)
    );
  });
}
