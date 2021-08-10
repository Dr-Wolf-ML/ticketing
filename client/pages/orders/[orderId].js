import React, { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [timeRemaining, setTimeRemaining] = useState();

    const { doRequest, errors, token = '' } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
            token,
        },
        onSuccess: () => Router.push('/orders'),
    });

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

    const orderAvailability =
        timeRemaining < 0 ? (
            <h5>Order expired.</h5>
        ) : (
            <>
                <h5>{`Cost: $${order.ticket.price.toFixed(2)}`}</h5>
                <h5>{`Time remaining to pay: ${timeRemaining} seconds`}</h5>
                <StripeCheckout
                    token={({ id }) => doRequest({ token: id })}
                    stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUB_KEY}
                    amount={order.ticket.price * 100}
                    email={currentUser.email}
                />
                {errors}
            </>
        );

    return (
        <>
            <h1>{`Order for: ${order.ticket.title}`}</h1>
            {orderAvailability}
        </>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;
