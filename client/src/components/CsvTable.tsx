import { useState } from "react";
import '../App.scss';

interface CSVTableProps {
    csvData: string[][];
}

const CSVTable: React.FC<CSVTableProps> = ({ csvData }) => {

    return (
        <div className="csv-grid-container" style={{ maxHeight: csvData.length > 14 ? 'calc(100vh - 260px)' : 'none', overflowY: csvData.length > 14 ? 'auto' : 'visible' }}>
            <div className="grid-header">
                {csvData[0]?.map((header, index) => (
                    <div className="header-grid-cell header" key={index}>
                        {header === "customerFacingNumber" ? 'cAuftragsNr' : header === "externalArticleId" ? 'cArtNr' : header === "articleNumber" ? "cBarcode" : header}
                    </div>
                ))}
            </div>

            <div className="grid-body" style={{ maxHeight: csvData.length > 14 ? 'calc(100vh - 300px)' : 'none', overflowY: csvData.length > 14 ? 'auto' : 'visible' }}>
                {csvData.slice(1).map((row, rowIndex) => (
                    <div className="grid-row" key={rowIndex}>
                        {row.map((col, colIndex) => {
                            if (row.length > 1) {
                                return (<div className="grid-cell" key={colIndex}>{col}</div>)
                            } else {
                                return '';
                            }
                        })}
                    </div>
                ))}
                {Array.from({ length: 12 - csvData.slice(1).length }).map((_, index) => (
                    <div className='grid-row' key={`empty-return-${index}`}>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                        <div className="grid-cell"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CSVTable;