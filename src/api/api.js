import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

export default class ApiManager {
    static getFullPath(path) {
        if (path.startsWith("/"))
            path = path.substring(1);
        return `${BASE_URL}/${path}`;
    }

    static get(path, params={}) {
        const fullPath = this.getFullPath(path);
        console.log(`GET Request at ${path} with params ${params}`);
        return axios.get(fullPath, {params: params});
    }

    static post(path, data={}) {
        const fullPath = this.getFullPath(path);
        console.log(`POST Request at ${path} with data ${data}`);
        return axios.post(fullPath, data);
    }
}