import API from './api';

const TOKEN_KEY = 'iptv_token';
const USER_KEY = 'iptv_user';

export const authService = {

    async login(username, password) {

        const response = await fetch(`${API}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error('Login failed');
        }

        localStorage.setItem(
            TOKEN_KEY,
            data.token
        );

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(data.user)
        );


        return data;
    },


    logout(){

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

    },


    getToken(){

        return localStorage.getItem(TOKEN_KEY);

    },


    getUser(){

        const user =
            localStorage.getItem(USER_KEY);

        return user ? JSON.parse(user) : null;

    }

};