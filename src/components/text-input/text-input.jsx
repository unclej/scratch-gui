import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../menu-bar/menu-bar.css';
import textInputStyles from '../menu-bar/project-title-input.css';

const TextInputComponent = ({
    className,
    onChange,
    children,
    ...props
}) => {
    if (props.disabled === true) {
        onChange = function () {};
    }

    return (
        <div className={classNames(styles.menuBarItem, styles.growable)}>
            <input
                className={classNames(textInputStyles.titleField)}
                id="projectNameTextInput"
                placeholder="Project Name"
                onChange={onChange}
                {...props}
            />
        </div>
    )
};

TextInputComponent.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

export default TextInputComponent;
