'use client';

import axios from "axios";
import Swal from 'sweetalert2'

const SERVER_PATH = process.env.NEXT_PUBLIC_SERVER_URL + '/user';

async function getAxiosAuthHeader() {
    let tokenData = await axios.get(
        '/api/handler'
    );
    return {
        headers: {
            authorization: 'Bearer ' + tokenData.data.token
        }
    }
}

export async function validateAdminUser(email: any) {
    let data = await axios.post(
        SERVER_PATH + '/validateAdminUser',
        {email: email},
        await getAxiosAuthHeader()
    );
    return !!(data.data && data.data.isAdmin && data.data.isAdmin === true);
}

export async function createUser(userData: any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/createUser',
            userData,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'User Created!',
            text: "User created successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while creating user. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function getAllUsers() {
    try {
        return await axios.get(
            SERVER_PATH + '/getAllUsers',
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching user. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}
