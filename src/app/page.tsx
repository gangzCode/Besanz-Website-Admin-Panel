'use client';

import Box from "@mui/material/Box";
import {useRouter} from "next/navigation";
import {useUser} from "@auth0/nextjs-auth0/client";
import {validateAdminUser} from "@/service/user-service";
import {useEffect, useState} from "react";
import NavBar from "@/component/nav-bar";
import Swal from "sweetalert2";
import CreateUser from "@/component/models/create-user";
import {
    Backdrop,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Modal
} from "@mui/material";
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import {
    Checklist, ChecklistOutlined,
    Inventory2,
    Inventory2Outlined,
    ManageAccounts, ManageAccountsOutlined, PendingActionsOutlined,
    ReceiptLong,
    ReceiptLongOutlined
} from "@mui/icons-material";
import Welcome from "@/component/welcome";
import UserManagement from "@/component/user-management";
import Features from "@/component/features";
import Packages from "@/component/packages";
import Bills from "@/component/bills";
import PendingBills from "@/component/pending-bills";

export default function Home() {
    const {user, error, isLoading} = useUser();
    const router = useRouter();
    const [validatingAdmin, setValidatingAdmin] = useState(true)
    const [showLoading, setShowLoading] = useState(false)
    const [userCreationModal, setUserCreationModal] = useState(false)

    const [selectedItem, setSelectedItem] = useState(0)

    const createUserModalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 5,
        boxShadow: 24,
        p: 4,
    };

    async function validateAdmin() {
        validateAdminUser(user!.sub).then(response => {
            if (response) {
                setValidatingAdmin(false);
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'You are not authorised to access this application.',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'OK'
                }).finally(() => {
                    router.push('/api/auth/logout');
                })
            }
        }).catch((e) => {
            console.error(e)
            Swal.fire({
                title: 'Error!',
                text: 'Error occurred while retrieving data. Please try again later. Server might not be available.',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'OK'
            }).finally(() => {
                router.push('/api/auth/logout');
            })
        })
    }

    function logout() {
        router.push('/api/auth/logout');
    }

    useEffect(() => {
        if (!isLoading && user && user.sub) {
            validateAdmin().then();
        } else if (!isLoading && (!user || !user.sub)) {
            setValidatingAdmin(false);
        }
    }, [isLoading]);

    const customSelect = {
        "&.Mui-selected": {
            backgroundColor: "#152E4A",
            color: 'white',
            "svg": {
                color: 'white'
            },
            ":hover": {
                backgroundColor: "#1e4977"
            }
        }
    };

    if (isLoading || validatingAdmin) {
        return (
            <Box m={0} p={0} bgcolor="whitesmoke" height={1} width={1} display="flex" alignItems="center"
                 textAlign="center">
                <Box width={1} textAlign="center" fontWeight="bold">
                    Loading Please Wait
                </Box>
            </Box>
        );
    } else if (user) {
        return (
            <>
                <Backdrop
                    sx={{color: '#fff', zIndex: (theme) => theme.zIndex.modal + 10}}
                    open={showLoading}
                >
                    <CircularProgress color="inherit"/>
                </Backdrop>
                <Box m={0} p={0} bgcolor="whitesmoke" height="100%" width={1}>
                    <NavBar></NavBar>
                    <Grid container height={"100%"}>
                        <Grid item xs={2} pt={"69px"} height={'100%'} sx={{bgcolor: '#82c7e6', borderRadius: '0 0 10px 0'}}>
                            <List>
                                <ListItem>
                                    <ListItemButton onClick={() => setSelectedItem(1)}
                                                    selected={selectedItem == 1} sx={customSelect}>
                                        <ListItemIcon>
                                            <ManageAccountsOutlined sx={{color: 'black', pl: 1}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={"Manage Users"} color={'inherit'}/>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={() => setSelectedItem(2)}
                                                    selected={selectedItem == 2} sx={customSelect}>
                                        <ListItemIcon>
                                            <ChecklistOutlined sx={{color: 'black', pl: 1}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={"Available Features"} color={'black'}/>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={() => setSelectedItem(3)}
                                                    selected={selectedItem == 3} sx={customSelect}>
                                        <ListItemIcon>
                                            <Inventory2Outlined sx={{color: 'black', pl: 1}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={"Bundled Packages"} color={'black'}/>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={() => setSelectedItem(4)}
                                                    selected={selectedItem == 4} sx={customSelect}>
                                        <ListItemIcon>
                                            <PendingActionsOutlined sx={{color: 'black', pl: 1}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={"Pending Bills"} color={'black'}/>
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton onClick={() => setSelectedItem(5)}
                                                    selected={selectedItem == 5} sx={customSelect}>
                                        <ListItemIcon>
                                            <ReceiptLongOutlined sx={{color: 'black', pl: 1}}/>
                                        </ListItemIcon>
                                        <ListItemText primary={"Submitted Bills"} color={'black'}/>
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={10} pt={"69px"} height={'100%'} width={'100%'}>
                            {
                                (selectedItem === 0) ? <Welcome></Welcome> :
                                    (selectedItem === 1) ? <UserManagement setShowLoading={setShowLoading} setUserCreationModal={setUserCreationModal}></UserManagement> :
                                        (selectedItem === 2) ? <Features setShowLoading={setShowLoading}></Features> :
                                            (selectedItem === 3) ? <Packages setShowLoading={setShowLoading}></Packages> :
                                            (selectedItem === 4) ? <PendingBills setShowLoading={setShowLoading}></PendingBills>
                                                : <Bills setShowLoading={setShowLoading}></Bills>
                            }
                        </Grid>
                    </Grid>
                </Box>
                <Modal open={userCreationModal}>
                    <Box sx={createUserModalStyle}>
                        <CreateUser setUserCreationModal={setUserCreationModal} setShowLoading={setShowLoading}/>
                    </Box>
                </Modal>
            </>
        );
    } else {
        router.push('/api/auth/login');
    }
}
