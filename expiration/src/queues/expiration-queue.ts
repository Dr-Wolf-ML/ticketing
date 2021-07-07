import Queue from 'bull';

interface Job {
    orderId: string;
}

const expirationQueue = new Queue<Job>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(async job => {
    console.log(
        'Publish an expiration:complete event for orderId: ',
        job.data.orderId,
    );
});

export { expirationQueue };
