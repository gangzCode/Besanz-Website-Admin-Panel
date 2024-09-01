'use client';

import axios from "axios";
import Swal from 'sweetalert2'

const SERVER_PATH = process.env.NEXT_PUBLIC_SERVER_URL + '/bill';

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

export async function createBill(featureData: any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/createBill',
            featureData,
            await getAxiosAuthHeader()
        );
        Swal.fire({
            title: 'Bill Created!',
            text: "Bill created successfully.",
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while creating bill. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function getAllBillsSubmitted(searchParam: any) {
    try {
        return await axios.post(
            SERVER_PATH + '/getAllBillsSubmitted',
            searchParam,
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching bills. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}

export async function getAllBillsPending(searchParam: any) {
    try {
        return await axios.post(
            SERVER_PATH + '/getAllBillsPending',
            searchParam,
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching bills. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}

export async function getPDFData(billId: any) {
    try {
        return await axios.post(
            SERVER_PATH + '/getBillPDFData',
            {
                bill_id: billId
            },
            await getAxiosAuthHeader()
        );
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while fetching PDF. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return [];
    }
}

export async function updateBill(feature:any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/updateBill',
            feature,
            await getAxiosAuthHeader()
        );
        if (data && data.data.code == 0) {
            Swal.fire({
                title: 'Bill Updated!',
                text: "Bill updated successfully.",
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        } else {
            Swal.fire({
                title: 'Bill Update Failed!',
                text: data.data.data,
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        }
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while updating bill. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function submitBill(bill_id:any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/submitBill',
            {
                bill_id: bill_id
            },
            await getAxiosAuthHeader()
        );
        if (data && data.data.code == 0) {
            Swal.fire({
                title: 'Bill Submitted!',
                text: "Bill submitted successfully.",
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        } else {
            Swal.fire({
                title: 'Bill Submit Failed!',
                text: data.data.data,
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        }
        return true;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while submitted bill. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return false;
    }
}

export async function deleteBill(feature:any) {
    try {
        let data = await axios.post(
            SERVER_PATH + '/deleteBill',
            feature,
            await getAxiosAuthHeader()
        );
        if (data && data.data.code == 0) {
            Swal.fire({
                title: 'Bill Deleted!',
                text: "Bill deleted successfully.",
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        } else {
            Swal.fire({
                title: 'Bill Update Failed!',
                text: data.data.data,
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'OK'
            })
        }
        return;
    } catch (e: any) {
        console.error(e)
        Swal.fire({
            title: 'Error!',
            text: (e?.response?.data?.data) ? e?.response?.data?.data : "Error occurred while deleting bill. Please try again later.",
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK'
        })
        return;
    }
}

export function openInvoicePDF(base64Data: any) {
    if (window) {
        // Decode base64 string, remove the `data:application/pdf;base64,` part
        const base64 = base64Data.split(',')[1];
        // Convert the base64 string to a byte array
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        // Create a Blob from the byte array
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        // Create a URL for the Blob and open it in a new tab
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl);
    }
}

export function downloadInvoicePdf(base64Data: any, fileName: any) {
    if (document) {
        const base64 = base64Data.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }
};
