import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // we are on the server
        // requests should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

        return axios.create({
            baseURL:
                'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers,
        });
    } else {
        // we are in the browser
        // requests can be made with a base URL ''
        return axios.create({
            baseURL: '/',
        });
    }
};

export default buildClient;
