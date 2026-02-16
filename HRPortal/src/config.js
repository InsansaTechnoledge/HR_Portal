const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    // : 'https://hrportal.insansa.com';
    :'https://hrportal.harshvaidya.online/';


const apibaseURl = "http://127.0.0.1:8000";

export default API_BASE_URL;
export { apibaseURl };