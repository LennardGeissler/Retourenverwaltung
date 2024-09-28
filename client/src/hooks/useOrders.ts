import React, { SetStateAction, useState } from 'react';
import { fetchOrders } from '../api';
import { Order, SelectedArticle } from '../types';

interface useOrdersProps {
    setShowArticles: (showArticles: boolean) => void,
    setSelectedArticles: (selectedArticles: SelectedArticle[]) => void,
    setSelectedOrder: React.Dispatch<SetStateAction<Order | undefined>>,
    handlefetchArticles: (orderNumber: string) => void;
}

export const useOrders = ({ setShowArticles, setSelectedArticles, setSelectedOrder, handlefetchArticles }: useOrdersProps) => {
    const [orders, setOrders] = useState<Order[]>([]);

    const handlefetchOrders = async (barcode: string) => {
        try {
            const data = await fetchOrders(barcode);
            setOrders(data);
            setShowArticles(false);
            setSelectedArticles([]);

            if (data.length === 1) {
                setSelectedOrder(data[0]);
                handlefetchArticles(data[0].Auftragsnummer.toString());
            }
        } catch (error) {
            console.error(error);
        }
    };

    return { handlefetchOrders, orders, setOrders };
};
