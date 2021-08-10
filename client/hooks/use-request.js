import { useState } from 'react';
import axios from 'axios';

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    console.log('useRequest received url: ', url);
    console.log('useRequest received method: ', method);
    console.log('useRequest received body: ', body);
    console.log('useRequest received onSuccess: ', onSuccess);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);

            const bodyWithProps = {
                ...body,
                ...props,
            };

            const response = await axios[method](url, bodyWithProps);

            console.log('response from doRequest', response);

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            console.log('err: ', err);
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map((err) => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    return { doRequest, errors };
};
