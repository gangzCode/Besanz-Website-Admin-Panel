import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
    Chip,
    Collapse,
    Divider, FormControl, InputLabel,
    Modal,
    Paper,
    Popover,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {Download, ExpandCircleDownOutlined, Search, Visibility} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as React from "react";
import {useEffect, useState} from "react";
import Swal from "sweetalert2";
import {
    deleteBill,
    downloadInvoicePdf,
    getAllBillsPending,
    getPDFData,
    openInvoicePDF,
    submitBill
} from "@/service/bill-service";
import MenuItem from "@mui/material/MenuItem";
import {DateRange} from 'react-date-range';
import {add} from "date-fns";
import {getAllUsers} from "@/service/user-service";
import {useUser} from "@auth0/nextjs-auth0/client";
import CreateBill from "@/component/models/create-bill";
import {deleteFeature} from "@/service/feature-service";

const PendingBills = ({setShowLoading}: any) => {

    const {user, error, isLoading} = useUser();
    const [showCreateModel, setShowCreateModel] = useState<any>(false);
    const [showViewModel, setShowViewModel] = useState<any>(false);

    const [filter, setFilter] = useState('date');
    const [filterUser, setFilterUser] = useState('');
    const [dateRange, setDateRange] = useState([
        {
            startDate: add(new Date(), {months: -3}),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const [users, setUsers] = useState<any>([]);
    const [bills, setBills] = useState<any>([]);
    const [updateObj, setUpdateObj] = useState<any>(null);

    const createModalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        bgcolor: 'background.paper',
        borderRadius: 5,
        boxShadow: 24,
        p: 4,
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

    useEffect(() => {
        if (showCreateModel == false)
            loadData();
    }, [showCreateModel]);

    const loadData = () => {
        setShowLoading(true);
        setBills([]);
        let searchParam = {
            filter: filter,
            filterUser: filterUser,
            startDate: dateRange[0].startDate,
            endDate: dateRange[0].endDate
        };
        getAllBillsPending(searchParam).then((response: any) => {
            setShowLoading(false);
            if (response && response?.status == 200 && response.data) {
                setBills(response.data);
            }
        }).catch(() => {
            setShowLoading(false);
        });
    }

    const deletePackageBtn = (packageObj: any) => {
        Swal.fire({
            title: 'Confirm Delete',
            html: `<div><b>Are you sure to delete '` + packageObj.name + `'?</b></div>`,
            icon: 'error',
            heightAuto: false,
            showCancelButton: false,
            showDenyButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Cancel',
            denyButtonText: 'Delete',
            confirmButtonColor: '#6e7881',
        }).then(async (result) => {
            if (result.isDenied) {
                setShowLoading(true);
                await deleteBill(packageObj);
                loadData();
            }
        });
    }

    const openInvoice = (package_id: any) => {
        setShowLoading(true);
        getPDFData(package_id).then((response: any) => {
            setShowLoading(false);
            if (response.data && response.data.length > 0) {
                openInvoicePDF(response.data[0].data);
            }
        });
    }

    const downloadInvoice = (package_id: any, name: any) => {
        setShowLoading(true);
        getPDFData(package_id).then((response: any) => {
            setShowLoading(false);
            if (response.data && response.data.length > 0) {
                downloadInvoicePdf(response.data[0].data, name);
            }
        });
    }

    return (
        <Box height={'100%'} width={'100%'} overflow={'auto'}>
            <Box p={2} maxHeight={'90%'}>
                <Box display={'flex'} alignItems={'center'} mb={1} px={1}>
                    <Typography sx={{flexGrow: 1}} variant='h5' margin={0}>Pending Bills</Typography>
                    <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                            onClick={() => {
                                setUpdateObj(null)
                                setTimeout(() => {
                                    setShowCreateModel(true)
                                });
                            }}>
                        Create Bill
                    </Button>
                </Box>
                <Paper sx={{width: '100%', maxHeight: '100%', overflow: 'hidden'}}>
                    <Box width='100%' display='flex' alignItems='center' px={2} py={1}>
                        <Typography fontSize={16} margin={0} mr={2}>Filter by : </Typography>
                        <Select
                            value={filter}
                            size='small'
                            sx={{marginRight: 2}}
                            onChange={(data) => {
                                setFilter(data.target.value)
                            }}
                        >
                            <MenuItem value={'date'}>Date</MenuItem>
                            <MenuItem value={'user'}>User</MenuItem>
                        </Select>
                        {(filter == 'user') ?
                            <FormControl sx={{minWidth: 135}}>
                                <InputLabel id="user-select-label" size='small'>Select User</InputLabel>
                                <Select
                                    value={filterUser}
                                    size='small'
                                    label='Select User'
                                    labelId='user-select-label'
                                    onChange={(data) => {
                                        setFilterUser(data.target.value)
                                    }}
                                >
                                    {
                                        users.map((user: any) => (
                                            <MenuItem key={user._id} value={user.email}>{user.name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            :
                            <>
                                <Button aria-describedby={id} variant="outlined" onClick={handleClick}>
                                    {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
                                </Button>
                                <Popover
                                    id={id}
                                    open={open}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={(item: any) => setDateRange([item.selection])}
                                        moveRangeOnFirstSelection={false}
                                        ranges={dateRange}
                                        dateDisplayFormat="dd/MM/yyyy"
                                        maxDate={new Date()}
                                    />
                                </Popover>
                            </>
                        }
                        <Button sx={{ml: 2}} variant="outlined" color="primary" size="medium"
                                disabled={(filter == 'user' && filterUser == '')} onClick={loadData}
                                endIcon={<Search/>}>
                            Search
                        </Button>
                    </Box>
                    <Divider/>
                    <TableContainer sx={{maxHeight: 'calc(100% - 80px)'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align={"center"}>User</TableCell>
                                    <TableCell align={"center"}>Price</TableCell>
                                    <TableCell align={"center"}>Status</TableCell>
                                    <TableCell align={"center"}>Invoice</TableCell>
                                    <TableCell align={"center"}>Created At</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(bills.length > 0) ?
                                    bills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((packageRow: any) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={packageRow._id}>
                                                <TableCell>{packageRow.name}</TableCell>
                                                <TableCell align={"center"}>{packageRow.user_email}</TableCell>
                                                <TableCell align={"right"}>$ {(Math.round(packageRow.price * 100) / 100).toFixed(2)}</TableCell>
                                                <TableCell align={"center"}>
                                                    {(packageRow.status == 'P') ?
                                                        <Chip label="Pending" color="primary" size='small'/>
                                                        :
                                                        (packageRow.status == 'T') ?
                                                            <Chip label="To Be Paid" color="warning" size='small'/>
                                                            :
                                                            (packageRow.status == 'C') ?
                                                                <Chip label="Paid" color="success" size='small'/>
                                                                :
                                                                (packageRow.status == 'E') ?
                                                                    <Chip label="Error" color="error" size='small'/>
                                                                    :
                                                                    <Chip label="Invalid" color="warning" size='small'/>
                                                    }
                                                </TableCell>
                                                <TableCell align={"center"}>
                                                    {(packageRow.contain_invoice) ?
                                                        <>
                                                            <IconButton size="small" color={"primary"}
                                                                        onClick={() => {
                                                                            openInvoice(packageRow._id);
                                                                        }}>
                                                                <Visibility fontSize="small"/>
                                                            </IconButton>
                                                            <IconButton size="small" sx={{ml: 2}} color={"primary"}
                                                                        onClick={() => {
                                                                            downloadInvoice(packageRow._id, packageRow.name + '_invoice.pdf');
                                                                        }}>
                                                                <Download fontSize="small"/>
                                                            </IconButton>
                                                        </>
                                                        :
                                                        "N/A"
                                                    }
                                                </TableCell>
                                                <TableCell align={"center"}>
                                                    {new Date(packageRow.created_date).toLocaleString()}
                                                </TableCell>
                                                <TableCell align={"center"}>
                                                    <IconButton size="small" color="primary"
                                                                onClick={() => {
                                                                    setUpdateObj(packageRow);
                                                                    setTimeout(() => {
                                                                        setShowViewModel(true)
                                                                    });
                                                                }}>
                                                        <Visibility fontSize="small"/>
                                                    </IconButton>
                                                    {(packageRow.status == 'P') &&
                                                        <>
                                                        <IconButton size="small" sx={{ml: 2}}
                                                                    onClick={() => {
                                                                        setUpdateObj(packageRow);
                                                                        setTimeout(() => {
                                                                            setShowCreateModel(true)
                                                                        });
                                                                    }}>
                                                            <EditIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            size="small" sx={{ml: 1}}
                                                            onClick={() => deletePackageBtn(packageRow)}>
                                                            <DeleteIcon fontSize="small"/>
                                                        </IconButton>
                                                    </>
                                                    }
                                                    {(packageRow.status == 'P') &&
                                                        <Button sx={{ml:2}} variant="contained" color="primary" size="small"
                                                                onClick={() => {
                                                                    Swal.fire({
                                                                        title: 'Confirm Submit',
                                                                        text: 'Are you sure to submit this bill to customer?',
                                                                        icon: 'question',
                                                                        heightAuto: false,
                                                                        showCancelButton: false,
                                                                        showDenyButton: true,
                                                                        showConfirmButton: true,
                                                                        confirmButtonText: 'Cancel',
                                                                        denyButtonText: 'Submit',
                                                                        confirmButtonColor: '#6e7881',
                                                                        denyButtonColor: '#2e7d32'
                                                                    }).then(async (result) => {
                                                                        if (result.isDenied) {
                                                                            setShowLoading(true);
                                                                            await submitBill(packageRow._id);
                                                                            loadData();
                                                                        }
                                                                    });
                                                                }}>
                                                            SUBMIT
                                                        </Button>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) :
                                    <TableRow hover role="checkbox" tabIndex={-1}>
                                        <TableCell colSpan={6} align={"center"}>
                                            <h2>No Bills Found</h2>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={bills.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
            <Modal open={showCreateModel}>
                <Box sx={createModalStyle}>
                    <CreateBill setCreationModal={setShowCreateModel} setShowLoading={setShowLoading} users={users}
                                   updateObj={updateObj}/>
                </Box>
            </Modal>
            <Modal open={showViewModel}>
                <Box sx={createModalStyle}>
                    <Box display='flex' fontSize={"x-large"} fontWeight={'bold'}>
                        {updateObj?.name} - $ {(Math.round(updateObj?.price * 100) / 100).toFixed(2)}
                    </Box>
                    <Box bgcolor={'whitesmoke'} borderRadius={3} mt={2} p={1} width='100%'
                         maxHeight='80vh' overflow='auto'>
                        {
                            updateObj?.features.map((feature: any, index: number) => (
                                <Box key={feature._id}>
                                    <Box fontWeight={'bold'} pt={1} display={'flex'} alignItems={'center'}>
                                        <ExpandCircleDownOutlined
                                            sx={{
                                                transition: "transform 0.2s linear",
                                                transform: feature.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                visibility: feature.children.length > 0 ? 'visible' : 'hidden'
                                            }}
                                            onClick={() => {
                                                feature.collapsed = !feature.collapsed;
                                                setUpdateObj({...updateObj});
                                            }}
                                        >
                                        </ExpandCircleDownOutlined>
                                        <Box pl={1}>{feature.name}</Box>
                                    </Box>
                                    <Collapse in={!feature.collapsed}>
                                        <Box ml={'52px'} pl={0} borderLeft={'1px solid #0003'}>
                                            {
                                                feature.children.map((child: any) => (
                                                    <Box key={child._id} py={1} display={'flex'}
                                                         alignItems={'center'}>
                                                        <Box pl={2} height="1px" bgcolor="#0003"></Box>
                                                        <Box pl={1}>{child.name}</Box>
                                                    </Box>
                                                ))
                                            }
                                        </Box>
                                    </Collapse>
                                    {
                                        index < updateObj.features.length - 1 &&
                                        <Divider sx={{pt: (feature.collapsed) ? 1 : 0}}/>
                                    }
                                </Box>
                            ))
                        }
                        {updateObj?.features.length == 0 &&
                            <Box display={'flex'} alignItems={'center'} justifyContent={'center'}
                                 fontWeight="bold" minHeight={'40vh'}>
                                No features available.
                            </Box>
                        }
                    </Box>
                    <Box width='100%' display='flex' justifyContent='center' mt={2}>
                        <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                                onClick={() => {
                                    setShowViewModel(false);
                                }}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default PendingBills;