import React from 'react';
import {FormattedMessage} from 'react-intl';

import successImage from '../assets/icon--success.svg';

const AlertLevels = {
    SUCCESS: 'success',
    WARN: 'warn'
};

const alerts = [
    {
        alertId: 'createSuccess',
        iconURL: successImage,
        level: 'success',
        clearList: ['creating'],
        content: (
            <FormattedMessage
                defaultMessage="Successfully created."
                description="Message indicating that project was successfully created"
                id="gui.alerts.createsuccess"
            />
        )
    },
    {
        alertId: 'creating',
        level: 'warn',
        iconURL: 'spin',
        content: (
            <FormattedMessage
                defaultMessage="Creating..."
                description="Message indicating that project is in process of creating"
                id="gui.alerts.creating"
            />
        )
    },
    {
        alertId: 'saveSuccess',
        iconURL: successImage,
        level: 'success',
        clearList: ['saving'],
        content: (
            <FormattedMessage
                defaultMessage="Successfully saved."
                description="Message indicating that project was successfully saved"
                id="gui.alerts.savesuccess"
            />
        )
    },
    {
        alertId: 'saving',
        level: 'warn',
        iconURL: 'spin',
        content: (
            <FormattedMessage
                defaultMessage="Saving..."
                description="Message indicating that project is in process of saving"
                id="gui.alerts.saving"
            />
        )
    },
    {
        alertId: 'remixing',
        level: 'warn',
        iconURL: 'spin',
        content: (
            <FormattedMessage
                defaultMessage="Remixing..."
                description="Message indicating that project is in process of remixing"
                id="itchLocale.alerts.remixing"
            />
        )
    },
    {
        alertId: 'remixSuccess',
        level: 'success',
        iconURL: successImage,
        clearList: ['remixing'],
        content: (
            <FormattedMessage
                defaultMessage="Successfully remixed."
                description="Message indicating that project was successfully remixed"
                id="itchLocale.alerts.remixed"
            />
        )
    },
    {
        alertId: 'saveOriginalProject',
        level: 'warn',
        iconURL: 'spin',
        content: (
            <FormattedMessage
                defaultMessage="Save original project..."
                description="Message indicating that project is on process of saving original Project"
                id="itchLocale.alerts.savingOriginal"
            />
        )
    },
    {
        alertId: 'coping',
        level: 'warn',
        iconURL: 'spin',
        clearList: ['saveOriginalProject'],
        content: (
            <FormattedMessage
                defaultMessage="Coping..."
                description="Message indicating that project is on process of coping Project"
                id="itchLocale.alerts.coping"
            />
        )
    },
    {
        alertId: 'copySuccess',
        level: 'success',
        iconURL: successImage,
        clearList: ['coping'],
        content: (
            <FormattedMessage
                defaultMessage="Successfully copied."
                description="Message indicating that project was successfully copied"
                id="itchLocale.alerts.successfullyCopied"
            />
        )
    }
];

export {
    alerts as default,
    AlertLevels
};
