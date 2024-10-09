import { Order } from '../types'

interface OrdersTableProps {
    orders:  Order[],
    handleOrderClick: (order: Order) => void,
}

const OrdersTable:React.FC<OrdersTableProps> = ({ orders, handleOrderClick}) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Retourennummer</th>
                    <th>Auftragsnummer</th>
                    <th>Rechnungsnummer</th>
                    <th>Erstelldatum</th>
                    <th>Lieferdatum</th>
                    <th>Kundenname</th>
                    <th>Adresse</th>
                </tr>
            </thead>
            <tbody>
                {orders.length > 0 ? orders.map((order, index) => (
                    <tr key={index} onClick={() => handleOrderClick(order)}>
                        <td>{order.Retourennummer}</td>
                        <td>{order.Auftragsnummer}</td>
                        <td>{order.Rechnungsnummer}</td>
                        <td>{order.Erstelldatum instanceof Date ? new Date(order.Erstelldatum).toLocaleDateString() : null}</td>
                        <td>{order.Lieferdatum instanceof Date ? new Date(order.Lieferdatum).toLocaleDateString() : null}</td>
                        <td>{order.Kundenname}</td>
                        <td>{order.Adresse}</td>
                    </tr>
                )) : (
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )}
                {orders.length < 14 && Array.from({ length: 16 - orders.length }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                        <td colSpan={7}>&nbsp;</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default OrdersTable;