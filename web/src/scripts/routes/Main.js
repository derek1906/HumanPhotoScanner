import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MainTodoList from "../components/MainTodoList.jsx";

export default function Main(props){
    return (
        <React.Fragment>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">Todo List</Typography>
                </Toolbar>
            </AppBar>
            <div>
                <MainTodoList />
            </div>
        </React.Fragment>
    );
};