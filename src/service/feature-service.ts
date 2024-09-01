'use client';

import axios from "axios";
import Swal from 'sweetalert2'

const SERVER_PATH = process.env.NEXT_PUBLIC_SERVER_URL + '/feature';

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

export async function createFeature(featureData: any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/createFeature',
            featureData,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Feature Created!',
            text: "Feature created successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while creating feature. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function getAllFeatures() {
    try {
        return await axios.get(
            SERVER_PATH + '/getAllFeatures',
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching features. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}

export async function updateFeature(feature:any) {
    try {
        await axios.post(
            SERVER_PATH + '/updateFeature',
            feature,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Feature Updated!',
            text: "Feature updated successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while updating feature. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function deleteFeature(feature:any) {
    try {
        await axios.post(
            SERVER_PATH + '/deleteFeature',
            feature,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Feature Deleted!',
            text: "Feature deleted successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while deleting feature. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return;
    }
}
