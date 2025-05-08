import { Adventure } from '@js/types';

/**
 * Fills adventure form inputs with provided adventure data.
 * Safely handles missing fields.
 */
export const fillAdventureForm = (adventure: Partial<Adventure>) => {
  (document.getElementById('name') as HTMLInputElement).value =
    adventure.name ?? '';
  (document.getElementById('description') as HTMLInputElement).value =
    adventure.description ?? '';
  (document.getElementById('summary') as HTMLTextAreaElement).value =
    adventure.summary ?? '';

  (document.getElementById('distance') as HTMLInputElement).value = String(
    adventure.distance ?? '',
  );
  (document.getElementById('duration') as HTMLInputElement).value = String(
    adventure.duration ?? '',
  );
  (document.getElementById('maxGroupSize') as HTMLInputElement).value = String(
    adventure.maxGroupSize ?? '',
  );
  (document.getElementById('price') as HTMLInputElement).value = String(
    adventure.price ?? '',
  );
  (document.getElementById('priceDiscount') as HTMLInputElement).value = String(
    adventure.priceDiscount ?? '',
  );

  (document.getElementById('difficulty') as HTMLSelectElement).value =
    adventure.difficulty ?? '';

  // Start Location
  (
    document.getElementById('startLocationDescription') as HTMLInputElement
  ).value = adventure.startLocation?.description ?? '';
  (document.getElementById('startLocationAddress') as HTMLInputElement).value =
    adventure.startLocation?.address ?? '';
  (document.getElementById('startLocationLng') as HTMLInputElement).value =
    adventure.startLocation?.coordinates?.[0] !== undefined
      ? String(adventure.startLocation.coordinates[0])
      : '';
  (document.getElementById('startLocationLat') as HTMLInputElement).value =
    adventure.startLocation?.coordinates?.[1] !== undefined
      ? String(adventure.startLocation.coordinates[1])
      : '';
};
