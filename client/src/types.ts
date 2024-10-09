export type Article = {
    Artikel: string,
    Artikelname: string,
    Anzahl: number,
    Retourenstatus: string,
    Rueckgabegrund: 'Keine Angabe',
    articleNumber: string,
}

export type SelectedArticle = {
    articleNumber: string;
    quantity: number;
}

export type Order = {
    Retourennummer: string,
    Auftragsnummer: number,
    Rechnungsnummer: string,
    Erstelldatum: Date,
    Lieferdatum: Date,
    Kundenname: string,
    Adresse: string,
    GASBarcode: string,
}

export type AddressParts = {
    streetAndNumber: string;
    postalCode: string;
    city: string;
}