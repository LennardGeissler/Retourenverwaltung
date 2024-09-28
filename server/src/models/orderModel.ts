import { queryDatabase } from '../utils/db';

export const fetchOrderDetails = async (barcode: string) => {
  const query = `
    SELECT DISTINCT 
      rr.cRetoureNr AS Retourennummer,         
      a.cAuftragsNr AS Auftragsnummer,           
      r.cRechnungsNr AS Rechnungsnummer,     
      a.dErstellt AS Erstelldatum,            
      l.dVersendet AS Lieferdatum,            
      adr.cVorname + ' ' + adr.cName AS Kundenname, 
      adr.cStrasse + ', ' + adr.cPLZ + ' ' + adr.cOrt AS Adresse,
      tv.cEnclosedReturnIdentCode AS GASBarcode              
    FROM Verkauf.tAuftrag a
    INNER JOIN Verkauf.tAuftragRechnung ar ON a.kAuftrag = ar.kAuftrag
    INNER JOIN dbo.tRechnung r ON ar.kRechnung = r.kRechnung
    INNER JOIN dbo.tRMRetoure rr ON a.kAuftrag = rr.kBestellung
    INNER JOIN dbo.tLieferschein lf ON a.kAuftrag = lf.kBestellung
    INNER JOIN dbo.tLieferscheinEckdaten l ON lf.kLieferschein = l.kLieferschein
    INNER JOIN Verkauf.tAuftragAdresse adr ON a.kAuftrag = adr.kAuftrag
    INNER JOIN dbo.tLieferschein tl ON tl.kBestellung = a.kAuftrag
    INNER JOIN dbo.tVersand tv ON tv.kLieferschein = tl.kLieferschein
    WHERE a.cAuftragsNr = @barcode
  `;

  return queryDatabase(query, { barcode });
};
