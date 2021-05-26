import "./ReportsSearchOpportunities.css"
import Footer from "../Footer/Footer"
import Pagination from "./Pagination"
import OpportunityCard from "../OpportunityCard/OpportunityCard"
import { useEffect, useState } from "react"
import SubmitButton from "../SubmitButton/SubmitButton"
import {Row, Col} from "react-bootstrap";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {DataGrid, GridApi, GridToolbarContainer, GridToolbarExport, GridColTypeDef} from '@material-ui/data-grid';
import dateFormat from 'dateformat';
import moment from 'moment'
import { keys } from "@material-ui/core/styles/createBreakpoints"
import Moment from "moment";
import { CsvBuilder } from "filefy";

 function ExportButton() {
   return (
     <GridToolbarContainer>
       <GridToolbarExport />
     </GridToolbarContainer>
   );
 }

function ReportsSearchOpportunities(props) {
    const {user} = props;
    const history = useHistory();
    const navigateTo = () => history.push('/addOpportunity');
    const [opportunities, setOpportunities] = useState("");
    const [volunteers, setVolunteers] = useState("");
    async function fetchAll() {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/opportunities`);
            return response.data;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }
    async function fetchAllvolunteers() {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/volunteers`);
            return response.data;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }
    useEffect(() => {
        fetchAll().then(result => {
            if(result) {
                Object.keys(result).map(function(key, index) {
                    Object.assign(result[key], {volunteerHours: (result[key]).volunteers});
                    Object.assign(result[key], {volunteerDonate: (result[key]).volunteers});
                })
                setOpportunities(result);
            }
                
        })
        fetchAllvolunteers().then(result => {
            if(result)
                setVolunteers(result);
        })
    }, [])


    const columnsOpps = [
          {
            field: "Volunteer Data",
            headerName: "Volunteer Data",
            sortable: false,
            export: false,
            width: 130,
            disableClickEventBubbling: true,
            renderCell: (params) => {
              return <button className="exportButton" onClick={(e) => {
                const api = params.api;
                const fields = api
                .getAllColumns()
                .map((c) => c.field)
                .filter((c) => c !== "__check__" && !!c);
                const thisRow = {};

                fields.forEach((f) => {
                thisRow[f] = params.getValue(f);
                });
                const fileName = `${thisRow.title}Data`;
                const builder = new CsvBuilder(
                    fileName + ".csv"
                );
                let rowOpportunity = opportunities.filter(o => o.title == thisRow.title && o.location == thisRow.location);
                console.log(rowOpportunity);
                let rowVols = []
                if (rowOpportunity.length && rowOpportunity[0].volunteers !== undefined) {
                    rowVols = Object.keys(rowOpportunity[0].volunteers);
                    rowVols.forEach(function(part, index, theArray) {
                        let curVol = volunteers.filter(v => v._id == part);
                        console.log(curVol);
                        if (curVol.length && curVol[0] !== undefined) {
                            let hours = 0;
                            let donated = [];
                            let taskList = [];
                            Object.keys(curVol[0].opportunities).map(function(key, index) {
                                let tasks = curVol[0].opportunities[key];
                                console.log(tasks);
                                let times = tasks.map(task => {
                                    taskList.push(task.task);
                                    for (var i = 0; i < task.start.length; i++)
                                    {
                                        var begin = task.start[i];
                                        var end = task.end[i];
                                        let diff = moment.duration(moment(end).diff(moment(begin))).asHours();
                                        hours += diff;
                                    }
                                    for (var i = 0; i < task.donated.length; i++)
                                    {
                                        donated = donated.concat(task.donated);
                                    }
                                })
                            })
                            if (donated.length) {
                                donated.sort();
                                donated = donated.join(", ");
                            }
                            else {
                                donated = "N/A";
                            }
                            if (taskList.length) {
                                taskList.sort();
                                taskList = taskList.join(", ");
                            }
                            else {
                                taskList = "N/A";
                            }
                            theArray[index] = [curVol[0].firstName, curVol[0].lastName, curVol[0].email, curVol[0].phoneNum, curVol[0].address, taskList, hours.toFixed(2), donated];
                        }
                      });
                }
                builder
                    .setColumns( ['First Name', 'Last Name', 'Email', 'Phone Number', 'Address', "Tasks", "Hours Volunteered", "Items Donated"])
                    .addRows(rowVols)
                    .exportFile();
                } }>Export Volunteers</button>;
            }
          },
          {
            field: "Contact Volunteers",
            // headerName: "Export Volunteers",
            sortable: false,
            export: false,
            width: 130,
            disableClickEventBubbling: true,
            renderCell: (params) => {
              return <button className="exportButton" onClick={(e) => {
                const api = params.api;
                const fields = api
                .getAllColumns()
                .map((c) => c.field)
                .filter((c) => c !== "__check__" && !!c);
                const thisRow = {};

                fields.forEach((f) => {
                thisRow[f] = params.getValue(f);
                });

                
                const fileName = `${thisRow.title}VolunteerData`;
                const builder = new CsvBuilder(
                    fileName + ".csv"
                );
                let rowOpportunity = opportunities.filter(o => o.title == thisRow.title && o.location == thisRow.location);
                console.log(rowOpportunity);
                let rowVols = []
                if (rowOpportunity.length && rowOpportunity[0].volunteers !== undefined) {
                    rowVols = Object.keys(rowOpportunity[0].volunteers);
                    rowVols.forEach(function(part, index, theArray) {
                        console.log(part);
                        let curVol = volunteers.filter(v => v._id == part);
                        if (curVol.length && curVol[0] !== undefined) {
                            theArray[index] = [curVol[0].firstName, curVol[0].lastName, curVol[0].phoneNum];
                        }
                      });
                }
                builder
                    .setColumns( ['First Name', 'Last Name', 'Phone Number'])
                    .addRows(rowVols)
                    .exportFile();
                } }>Export Phone Numbers</button>;
            }
          },
        { field: 'title', headerName: 'Title', width: 250 },
        { field: 'location', headerName: 'Location', width: 250},
        { field: 'start_event', headerName: 'Start Date', width: 220, 
        valueGetter: ({ value }) => {
            if (Array.isArray(value))
            {
                return value.map(item => dateFormat(item, " mmmm dS, yyyy ") + "at " + dateFormat(item, "hh:MM TT", true)).join(', \n') 
            }
            else
            {
                return value
            }
            
        },
        sortComparator: (param1, param2) => {
            let date1 = param1.split(' at ').join().split('M,')[0];
            date1 = date1.substring(1, date1.length - 8);
            date1 = Moment(date1, 'MMMM Do YYYY');
            let date2 = param2.split(' at ').join().split('M,')[0];
            date2 = date2.substring(1, date2.length - 8);
            date2= Moment(date2, 'MMMM Do YYYY');
            return date1.diff(date2)
        },
        },
        { field: 'end_event', headerName: 'End Date', width: 220, 
        valueGetter: ({ value }) => {
            if (Array.isArray(value))
            {
                return value.map(item => dateFormat(item, " mmmm dS, yyyy ") + "at " + dateFormat(item, "hh:MM TT", true)).join(', \n') 
            }
            else
            {
                return value
            }
        },
        sortComparator: (param1, param2) => {
            let date1 = param1.split(' at ').join().split(', \n');
            date1 = date1[date1.length - 1]
            date1 = date1.substring(1, date1.length - 8);
            date1 = Moment(date1, 'MMMM Do YYYY');
            let date2 = param2.split(' at ').join().split(', \n');
            date2 = date2[date2.length - 1]
            date2 = date2.substring(1, date2.length - 8);
            date2= Moment(date2, 'MMMM Do YYYY');
            return date1.diff(date2)
        },
        },
        { field: 'skills', headerName: 'Interest', width: 200, 
        valueGetter: ({ value }) => { return value.join(' ') }},
        { field: 'volunteers', headerName: 'Total Volunteers', width: 170, 
        valueGetter: ({ value }) => Object.keys(value).length },
        { field: 'volunteerHours', headerName: 'Total Volunteer Hours', width: 190, 
        valueGetter: ({ value }) => {
            let hours = 0;
            if (Object.keys(value).length) {
                Object.keys(value).map(function(key, index) {
                    let tasks = value[key];
                    let times = tasks.map(task => {
                        for (var i = 0; i < task.start.length; i++)
                        {
                            var begin = task.start[i];
                            var end = task.end[i];
                            let diff = moment.duration(moment(end).diff(moment(begin))).asHours();
                            hours += diff;
                        }
                    })
                })
            }
            return hours.toFixed(2);
        }
    },
    { field: 'volunteerDonate', headerName: 'Donated Items', width: 200, 
        valueGetter: ({ value }) => {
            let donated = [];
            if (Object.keys(value).length) {
                Object.keys(value).map(function(key, index) {
                    let tasks = value[key];
                    let times = tasks.map(task => {  
                        for (var i = 0; i < task.donated.length; i++)
                        {
                            donated = donated.concat(task.donated);
                        }
                    })
                })
            }
            if (donated.length) {
                return donated.join(", ");
            }
            else {
                return "N/A"
            }
            
        }
    },
];
    return (        
        <div>
            {opportunities ? 
            <div style={{ height: 500, width: '100%', display: 'flex', padding: 50}}>
               <DataGrid className="Volgrid" 
               rows={opportunities} 
               columns={columnsOpps} 
               getRowId ={(row) => row._id}
               pageSize={5} 
               components={{
                  Toolbar: ExportButton
                  }}
               />
            </div>
            :
            <div></div>}
            <Footer />
        </div>
    )
}

export default ReportsSearchOpportunities;