import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import tabletFullScreen from '../lib/tablet-full-screen';

import ShareModalComponent from '../components/share-modal/share-modal.jsx';

import {
    closeShareProject
} from '../reducers/modals';

class ShareModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleTryIt',
            'handleCancel'
        ]);

        this.state = {
            hash_link: this.props.hash_link
        };
    }
    handleTryIt () {
        var textField = document.createElement('textarea')
        textField.innerText = this.state.hash_link;
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()
        this.props.onTryIt();
    }
    handleCancel () {
        this.props.onTryIt();
    }
    render () {
        return (
            <ShareModalComponent
                hash_link={this.state.hash_link}
                onCancel={this.handleCancel}
                onTryIt={this.handleTryIt}
            />
        );
    }
}

ShareModal.propTypes = {
    onTryIt: PropTypes.func
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    onTryIt: () => {
        dispatch(closeShareProject());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ShareModal);
