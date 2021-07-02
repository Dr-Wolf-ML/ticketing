export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (
                subject: string,
                data: string,
                callBack: () => void,
                // client: { publish: () => void },
            ) => {
                callBack();
            },
        ),
    },
};
