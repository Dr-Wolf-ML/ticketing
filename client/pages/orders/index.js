import styles from '../../scss/index.module.scss';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const OrderIndex = ({ orders }) => {
    const ordersList = orders.map((order) => {
        const [timeRemaining, setTimeRemaining] = useState();

        const orderPrice = order.ticket.price.toFixed(2);

        useEffect(() => {
            const countDown = () => {
                const timeToExpire = new Date(order.expiresAt) - new Date();
                setTimeRemaining(Math.round(timeToExpire / 1000));
            };

            countDown();
            const timerId = setInterval(countDown, 1000);

            return () => {
                clearInterval(timerId);
            };
        }, [order]);

        const orderStatus = () => {
            switch (order.status) {
                case 'cancelled':
                    return <td style={{ color: 'red' }}>Expired</td>;
                case 'created':
                    return <td style={{ color: 'blue' }}>Reserved</td>;
                case 'complete':
                    return <td style={{ color: 'green' }}>Purchased</td>;
                default:
                    return <td></td>;
            }
        };

        const timeStatus = () => {
            switch (order.status) {
                case 'cancelled':
                    const expired = new Date(order.expiresAt)
                        .toString()
                        .split(' ');
                    const expiredTimeStamp = `${expired[2]}-${expired[1]}-${expired[3]} at ${expired[4]} ${expired[5]}`;
                    return <td style={{ color: 'red' }}>{expiredTimeStamp}</td>;
                case 'created':
                    return (
                        <td
                            style={{ color: 'blue' }}
                        >{`${timeRemaining} secs remaining`}</td>
                    );
                case 'complete':
                    const purchased = new Date(order.ticket.wasPurchased)
                        .toString()
                        .split(' ');
                    const purchasedTimeStamp = `${purchased[2]}-${purchased[1]}-${purchased[3]} at ${purchased[4]} ${purchased[5]}`;
                    return (
                        <td style={{ color: 'green' }}>{purchasedTimeStamp}</td>
                    );
                default:
                    return <td></td>;
            }
        };

        return (
            <tr key={order.id}>
                <td className={styles.col1}>
                    <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
                        {order.ticket.title}
                    </Link>
                </td>
                <td className={styles.col2}>$US</td>
                <td className={styles.col3}>{orderPrice}</td>
                <td className={styles.col4}></td>
                <td className={styles.col5}>{orderStatus()}</td>
                <td>{timeStatus()}</td>
            </tr>
        );
    });

    return (
        <div className={styles.tableheader}>
            <h1>My Orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th colSpan="3">Price</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody className="container">{ordersList}</tbody>
            </table>
        </div>
    );
};

OrderIndex.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders');

    return { orders: data.activeOrders };
};

export default OrderIndex;
