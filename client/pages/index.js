import styles from '../scss/index.module.scss';
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        const ticketPrice = ticket.price.toFixed(2);
        const ticketStatus = ticket.orderId ? 'Reserved' : 'Available';

        // Only show tickets, whch have not been purchased yet
        if (ticket.wasPurchased) {
            return;
        }

        return (
            <tr key={ticket.id}>
                <td className={styles.col1}>
                    <Link
                        href="/tickets/[ticketId]"
                        as={`/tickets/${ticket.id}`}
                    >
                        {ticket.title}
                    </Link>
                </td>
                <td className={styles.col2}>$US</td>
                <td className={styles.col3}>{ticketPrice}</td>
                <td className={styles.col4}></td>
                <td className={styles.col5}>{ticketStatus}</td>
            </tr>
        );
    });

    return (
        <div className={styles.tableheader}>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th colSpan="3">Price</th>
                        <th id="status">Status</th>
                    </tr>
                </thead>
                <tbody className="container">{ticketList}</tbody>
            </table>
        </div>
    );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');

    return { tickets: data };
};

export default LandingPage;
