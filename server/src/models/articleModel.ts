import { queryDatabase } from '../utils/db';

export const fetchArticleDetails = async (orderNumber: string) => {
  const query = `
    SELECT DISTINCT
      ap.cArtNr AS Artikel,
      CASE 
        WHEN CHARINDEX('#', ap.cName) > 0 
        THEN SUBSTRING(ap.cName, 1, CHARINDEX('#', ap.cName) - 1)
        ELSE ap.cName
      END AS Artikelname,
      ap.fAnzahl AS Anzahl,
      rss.cName AS Retourenstatus,
      at.cBarcode AS articleNumber
    FROM Verkauf.tAuftrag a
    INNER JOIN Verkauf.tAuftragPosition ap ON a.kAuftrag = ap.kAuftrag
    INNER JOIN dbo.tRMRetoure rr ON a.kAuftrag = rr.kBestellung
    INNER JOIN dbo.tRMStatus rs ON rr.kRMStatus = rs.kRMStatus
    INNER JOIN dbo.tRMStatusSprache rss ON rs.kRMStatus = rss.kRMStatus
    INNER JOIN dbo.tArtikel at ON ap.cArtNr = at.cArtNr 
    WHERE a.cAuftragsNr = @orderNumber
    AND ap.nType = 1;
  `;

  return queryDatabase(query, { orderNumber });
};
