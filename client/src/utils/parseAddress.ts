import { AddressParts } from "../types";

export const parseAddress = (address: string): AddressParts => {
    const parts = address.split(',').map(part => part.trim());
    if (parts.length < 2) throw new Error('Die Adresse hat nicht das erwartete Format.');

    const streetAndNumber = parts.slice(0, parts.length - 1).join(', ');
    const [postalCode, ...cityParts] = parts[parts.length - 1].split(' ');
    const city = cityParts.join(' ');

    return { streetAndNumber, postalCode, city };
};