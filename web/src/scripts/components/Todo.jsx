import React from 'react';
import PropTypes from 'prop-types';

export default class Todo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            tempContent: props.content,
            editing: props.alwaysEdit || false
        }
        this.contentEmpty = !!this.props.content;
        this.inputElement = null;
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        content: PropTypes.string,
        onTodoChanged: PropTypes.func,
        onTodoRemoved: PropTypes.func,
        alwaysEdit: PropTypes.bool,
        placeholder: PropTypes.string
    }

    static defaultProps = {
        content: "",
        onTodoChanged: () => {},
        onTodoRemoved: () => {},
        alwaysEdit: false,
        placeholder: "Type something here...",
    }

    inputFocus(ele){
        if(!ele || ele == this.inputElement)    return true;
        this.inputElement = ele;

        if (!this.props.alwaysEdit) {
            ele.focus();
            ele.select();
        }
    }

    toggleEdit(){
        if (!this.state.editing){
            this.setState({
                tempContent: this.props.content
            });
        }

        this.setState({
            editing: this.props.alwaysEdit || !this.state.editing
        });
    }

    editContent(event){
        if(event.keyCode != 13) return true;

        // enter key pressed
        let new_value = event.target.value;

        if(!new_value && !this.props.alwaysEdit){
            // remove todo
            this.props.onTodoRemoved(this.props.id);
        }else{
            // updaye state
            this.toggleEdit();
            this.inputElement.blur();
            this.props.onTodoChanged(this.props.id, event.target.value)
            this.setState({
                tempContent: ""
            });
        }
    }

    getContent(){
        return this.contentEmpty ? this.props.content : "(empty)"
    }

    render(){
        if(this.state.editing){
            return (
                <input
                    ref={ele => {this.inputFocus(ele)}}
                    placeholder={this.props.placeholder}
                    onKeyDown={event => this.editContent(event)}
                    onChange={event => this.setState({ tempContent: event.target.value })}
                    value={this.state.tempContent} />
            );
        }else{
            return (
                <span onClick={this.toggleEdit.bind(this)}>{this.getContent()}</span>
            );
        }
    }

}