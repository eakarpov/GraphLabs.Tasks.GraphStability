import * as React from 'react';
export class Modal extends React.Component {
    public render() {
        return <div style={
            {
                position: 'absolute',
                width: 'fit-content',
                height: 'fit-content',
                border: 1
            }}>
            {this.props.children}
        </div>
    }
}
