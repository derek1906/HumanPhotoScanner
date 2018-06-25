import React from "react";
import * as react_redux from "react-redux";
import PlaylistAdd from "@material-ui/icons/PlaylistAdd";

import TitleBar from "../components/TitleBar.jsx";
import MainTodoList from "../components/MainTodoList.jsx";

import * as todosActions from "../actions/todos";

function Main(props){
    return (
        <React.Fragment>
            <TitleBar 
                titleText="Todo List"
                menuItems={[{
                    text: "Add Todo",
                    icon: <PlaylistAdd />,
                    onClick: () => props.onTodoAdded("Woot woot")
                }]}
            />
            <div style={{overflowY: "scroll", flex: 1}}>
                <MainTodoList />
            </div>
        </React.Fragment>
    );
};

export default react_redux.connect(
    state => {
        return {}
    },
    dispatch => {
        return {
            onTodoAdded: content => {
                dispatch(todosActions.addTodo(content));
            }
        }
    }
)(Main);