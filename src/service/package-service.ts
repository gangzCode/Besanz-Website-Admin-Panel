'use client';

import axios from "axios";
import Swal from 'sweetalert2'

const SERVER_PATH = process.env.NEXT_PUBLIC_SERVER_URL + '/package';

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

export async function createPackage(featureData: any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/createPackage',
            featureData,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Package Created!',
            text: "Package created successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while creating package. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function getAllPackages() {
    try {
        return await axios.get(
            SERVER_PATH + '/getAllPackages',
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching packages. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}

export async function updatePackage(feature:any) {
    try {
        await axios.post(
            SERVER_PATH + '/updatePackage',
            feature,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Package Updated!',
            text: "Package updated successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while updating package. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function deletePackage(feature:any) {
    try {
        await axios.post(
            SERVER_PATH + '/deletePackage',
            feature,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Package Deleted!',
            text: "Package deleted successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while deleting package. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return;
    }
}
