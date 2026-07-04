import API from './api';
import { authService } from './authService';


export const streamService = {


    async getChannels(){

        const token =
            authService.getToken();


        const response =
            await fetch(
                `${API}/channels?token=${token}`
            );


        const data =
            await response.json();


        if(!data.success){
            throw new Error(
                'Unable to load channels'
            );
        }


        return data.channels;
    }

};