
import { useState } from "react";
import { Article, SelectedArticle } from '../types';

interface ArticlesTableProps {
    articles: Article[];
    selectedArticles: SelectedArticle[];
    toggleSelectArticle: (articleNumber: string, action: 'increase' | 'decrease') => void;
}


const ArticlesTable:React.FC<ArticlesTableProps> = ({articles, selectedArticles, toggleSelectArticle}) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Art.-Nr.</th>
                    <th>Artikelname</th>
                    <th>Menge</th>
                    <th>Retourenstatus</th>
                    <th>Rückgabegrund</th>
                    <th className='select'> </th>
                </tr>
            </thead>
            <tbody>
                {articles.map((article) => {
                    const selectedArticle = selectedArticles.find(a => a.articleNumber === article.Artikel);
                    const selectedCount = selectedArticle ? selectedArticle.quantity : 0;
                    return (
                        <tr key={article.Artikel}>
                            <td>{article.Artikel}</td>
                            <td>{article.Artikelname}</td>
                            <td>{article.Anzahl}</td>
                            <td>{article.Retourenstatus}</td>
                            <td>{article.Rueckgabegrund}</td>
                            <td>
                                <div className="select-article">
                                    <button onClick={() => toggleSelectArticle(article.Artikel, 'decrease')} disabled={selectedCount <= 0}>-</button>
                                    <span>{selectedCount} / {article.Anzahl}</span>
                                    <button onClick={() => toggleSelectArticle(article.Artikel, 'increase')} disabled={selectedCount >= article.Anzahl}>+</button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                {Array.from({ length: 16 - articles.length }).map((_, index) => (
                    <tr key={`empty-article-${index}`}>
                        <td colSpan={6}>&nbsp;</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ArticlesTable;