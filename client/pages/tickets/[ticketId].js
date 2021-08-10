import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id,
        },
        onSuccess: (order) => {
            Router.push('/orders/[orderId]', `/orders/${order.id}`);
        },
    });

    const purchase = () => {
        if (ticket.orderId) {
            Router.push('/orders/[orderId]', `/orders/${ticket.orderId}`);
        } else {
            doRequest();
        }
    };

    const ticketStatus = ticket.orderId ? (
        <h5>Status - Reserved</h5>
    ) : (
        <h5>Status - Available</h5>
    );

    const ticketPrice = `$${ticket.price.toFixed(2)}`;

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h5>{`Price : ${ticketPrice}`}</h5>
            {ticketStatus}
            <button onClick={(e) => purchase()} className="btn btn-primary">
                Purchase
            </button>
            {errors}
        </div>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data };
};

export default TicketShow;
