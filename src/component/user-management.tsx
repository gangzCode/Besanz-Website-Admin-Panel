import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {getAllUsers} from "@/service/user-service";
import {useUser} from "@auth0/nextjs-auth0/client";
import {
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import * as React from "react";

const UserManagement = ({ setShowLoading, setUserCreationModal }:any) => {

    const {user, error, isLoading} = useUser();
    const [users, setUsers] = useState<any>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Table Helper Functions
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        if (!isLoading) {
            setShowLoading(true);
            getAllUsers().then((response: any) => {
                setShowLoading(false);
                if (response && response?.status == 200 && response.data) {
                    let userList = [];
                    for (let data of response.data) {
                        if (data.email != user?.email) {
                            userList.push(data);
                        }
                    }
                    setUsers(userList);
                }
            }).catch(() => {
                setShowLoading(false);
            });
        }
    }, [isLoading]);

    return (
        <Box height={'100%'} width={'100%'} overflow={'auto'}>
            <Box p={2} maxHeight={'90%'}>
                <Box display={'flex'} alignItems={'center'} mb={1} px={1}>
                    <Typography sx={{flexGrow: 1}} variant='h5' margin={0}>Available Users</Typography>
                    <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                            onClick={() => setUserCreationModal(true)}>
                        Create Users
                    </Button>
                </Box>
                <Paper sx={{width: '100%', maxHeight: '100%', overflow: 'hidden'}}>
                    <TableContainer sx={{maxHeight: 'calc(100% - 50px)'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align={"center"}>Email Verified</TableCell>
                                    <TableCell align={"center"}>Created At</TableCell>
                                    <TableCell align={"center"}>Updated At</TableCell>
                                    <TableCell align={"center"}>Blocked</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(users.length > 0) ?
                                    users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((userRow: any) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={userRow.email}>
                                                <TableCell>{userRow.name}</TableCell>
                                                <TableCell>{userRow.email}</TableCell>
                                                <TableCell align={"center"}>
                                                    {(userRow.email_verified === true)
                                                        ? <Chip label="Yes" color="success"/>
                                                        : (userRow.email_verified === false)
                                                            ? <Chip label="No" color="error"/>
                                                            : <Chip label="N/A" color="warning"/>
                                                    }
                                                </TableCell>
                                                <TableCell
                                                    align={"center"}>{new Date(userRow.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell
                                                    align={"center"}>{new Date(userRow.updated_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell align={"center"}>
                                                    {(userRow.blocked === true)
                                                        ? <Chip label="Yes" color="error"/>
                                                        : (userRow.blocked === false)
                                                            ? <Chip label="No" color="success"/>
                                                            : <Chip label="N/A" color="warning"/>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) :
                                    <TableRow hover role="checkbox" tabIndex={-1}>
                                        <TableCell colSpan={6} align={"center"}>
                                            <h2>No Users Available</h2>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={users.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
        </Box>
    );
}

export default UserManagement;