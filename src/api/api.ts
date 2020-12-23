import axios, {AxiosPromise} from "axios";

const BASE_URL: string = "https://127.0.0.1:5000";

export default class ApiManager {
    static getFullPath(path: string): string {
        if (path.startsWith("/"))
            path = path.substring(1);
        return `${BASE_URL}/${path}`;
    }

    static get(path: string, params: object={}): AxiosPromise {
        const fullPath = this.getFullPath(path);
        return axios.get(fullPath, {params: params});
    }

    static post(path: string, data: object={}): AxiosPromise {
        const fullPath = this.getFullPath(path);
        return axios.post(fullPath, data);
    }
}