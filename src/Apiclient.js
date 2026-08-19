import axios from "axios";
import { toast } from "react-toastify";
import { getCookieDomain } from "./utils/common/subdomainHelper";

export const api = axios.create({
	baseURL: process.env.REACT_APP_API_CALL //`https://peturboapi.azurewebsites.net` 
});

export class ApiClient {

	constructor(suffix) {
		this.api = axios.create({
			baseURL: process.env.REACT_APP_API_CALL, //`https://peturboapi.azurewebsites.net`            
		});

		this.api.interceptors.request.use((config) => {
			config.headers['X-User-Time'] = new Date().toISOString();
			config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
			return config;
		});
		this.customerurl = `/${suffix ?? "agileapt"}`;
	}

	async get(endpoint, atoken) {
		try {
			const res = await this.api.get(endpoint, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res.data;
		} catch (error) {
			console.error('Error in get request:', error);

			if (error.response?.status === 401) {

				toast.error('Oops, your session timed out! You’ve been logged out. Please sign in again to continue.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();

				return false
			}
			return '';
		}
	}

	async getres(endpoint, atoken) {
		try {
			const res = await this.api.get(endpoint, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res;
		} catch (error) {
			console.error('Error in get request:', error);
			if (error.response?.status === 401) {

				toast.error('Unauthorized: Your session has expired or your token is invalid. Please log in again.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();
				return false
			}
			return '';
		}
	}

	async post(endpoint, data, atoken) {
		try {
			const res = await this.api.post(endpoint, data, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res.data;
		} catch (error) {
			console.error('Error in post request:', error);
			if (error.response?.status === 401) {

				toast.error('Unauthorized: Your session has expired or your token is invalid. Please log in again.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();
				return false
			}
			return '';
		}
	}

	async postres(endpoint, data, atoken) {
		try {
			const res = await this.api.post(endpoint, data, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res;
		} catch (error) {
			console.error('Error in post request:', error);
			if (error.response?.status === 500) {

				toast.error(error.response?.data?.Message, {
					tokenid: 'postid',
				});
			}
			if (error.response?.status === 422) {
				toast.error(error.response?.data?.Message, {
					tokenid: 'postidnew',
				});
			}
			if (error.response?.status === 400) {
				const apiErrors = error.response?.data?.errors;
				if (apiErrors) {
					Object.values(apiErrors).flat().forEach(msg => toast.error(msg));
				} else if (error.response?.data?.Message) {
					toast.error(error.response?.data?.Message);
				}
			}
			if (error.response?.status === 401) {

				toast.error('Unauthorized: Your session has expired or your token is invalid. Please log in again.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();
				return false
			}
			return '';
		}
	}

	async put(endpoint, data, atoken) {
		try {
			const res = await this.api.put(endpoint, data, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res.data;
		} catch (error) {
			console.error('Error in put request:', error);
			if (error.response?.status === 401) {

				toast.error('Unauthorized: Your session has expired or your token is invalid. Please log in again.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();
				return false
			}
			return '';
		}
	}

	async putres(endpoint, data, atoken) {
		try {
			const res = await this.api.put(endpoint, data, {
				headers: {
					Authorization: `Bearer ${atoken}`,
					accept: 'application/json',
				},
			});
			return res;
		} catch (error) {
			console.error('Error in put request:', error);
			if (error.response?.status === 401) {

				toast.error('Unauthorized: Your session has expired or your token is invalid. Please log in again.', {
					tokenid: 'authentication error',
				});
				this.handleSessionExpiry();
				return false
			}
			return '';
		}
	}

	clearCookies = () => {
		const cookieDomain = getCookieDomain();
		const cookieNames = [
			'patkn', 'prtkn', 'pcid', 'pcsu', 'pcuserDetail',
			'pcutz', 'pcudc', 'pcloginCount', 'pcmlDetail', 'pcrcDetail'
		];

		cookieNames.forEach(cookieName => {
			// Clear without domain (for localhost)
			document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

			// Clear with domain (for production subdomains)
			if (cookieDomain) {
				document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookieDomain}`;
			}
		});
	};

	handleSessionExpiry = () => {
		this.clearCookies();

		// Build base URL for redirect
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		const port = window.location.port;
		const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;

		// Use setTimeout to ensure cookies are cleared before redirect
		setTimeout(() => {
			window.location.href = baseUrl;
		}, 100);
	};
}








