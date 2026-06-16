import axios from 'axios'

const baseurl = 'http://localhost:8000/'

const AxiosInstance = axios.create({
    baseURL: baseurl,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

AxiosInstance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('Token')
        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        else{
            config.headers.Authorization = ``
        }
        return config;
    
    }
)
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('Token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)
export default AxiosInstance
