import axios from "axios";

export const api = axios.create({ 
    baseURL: process.env.REACT_APP_APIPYTHON_CALL
});
export class FastApiClient{
   
    async get(endpoint,atoken,tenant) {try {
        const res = await api.get(endpoint, { headers: { Authorization: `Bearer ${atoken}`, accept: 'application/json', "X-Tenant": tenant }, });
        return res.data;
    } catch (error) {
        console.error('Error in get request:', error);
        return '';
    }
    }
     async getres(endpoint,atoken,tenant) {try {
        const res = await api.get(endpoint, { headers: { Authorization: `Bearer ${atoken}`, accept: 'application/json', "X-Tenant": tenant }, });
        return res;
    } catch (error) {
        console.error('Error in get request:', error);
        return '';
    }
    }
    async post(endpoint,data,atoken,tenant) {
        try {
            const res = await api.post(endpoint, data, {
                headers: {
                    Authorization: `Bearer ${atoken}`,
                    accept: 'application/json',
                    "X-Tenant": tenant
                },
            });
            return res.data;
        } catch (error) {
            // handle error here
            console.error('Error in post request:', error);
            return '';
        }
    }
    async postres(endpoint,data,atoken,tenant) {
        try {
            const res = await api.post(endpoint, data, {
                headers: {
                   
                    accept: 'application/json',
                    "X-Tenant": tenant,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return res;
        } catch (error) {
            // handle error here
            console.error('Error in post request:', error);
            return '';
        }
    }
    async postresmultipart(endpoint,data,tenant) {
        try {
            const res = await api.post(endpoint, data, {
                headers: {
                   
                    accept: 'application/json',
                    "X-Tenant": tenant,
                    'Content-Type': 'multipart/form-data',
                    responseType: "blob"
                },
            });
            return res;
        } catch (error) {
            // handle error here
            console.error('Error in post request:', error);
            return '';
        }
    }
    async postresblob(endpoint,data,tenant) {
        
        try {
            
            const res = await api.post(endpoint, data, { headers: { "X-Tenant": tenant }, responseType: "blob" });
            return res;
        } catch (error) {
            // handle error here
            console.error('Error in post request:', error);
            return '';
        }
    }
    async put(endpoint,data,atoken,tenant) {
        try {
            const res = await api.put(endpoint, data, {
                headers: {
                    Authorization: `Bearer ${atoken}`,
                    accept: 'application/json',
                    "X-Tenant": tenant
                },
            });
            return res.data;
        } catch (error) {
            // handle error here
            console.error('Error in put request:', error);
            return '';
        }
    }
    async putres(endpoint,data,atoken,tenant) {
        try {
            const res = await api.put(endpoint, data, {
                headers: {
                    Authorization: `Bearer ${atoken}`,
                    accept: 'application/json',
                    "X-Tenant": tenant
                },
            });
            return res;
        } catch (error) {
            // handle error here
            console.error('Error in put request:', error);
            return '';
        }
    }
}




