import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import ShareButton from './share-button.jsx';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import LanguageSelector from '../../containers/language-selector.jsx';
import SaveStatus from './save-status.jsx';
import SBFileUploader from '../../containers/sb-file-uploader.jsx';
import ProjectWatcher from '../../containers/project-watcher.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import AccountNav from '../../containers/account-nav.jsx';
/* import LoginDropdown from './login-dropdown.jsx'; */
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx';
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';

import {
    openTipsLibrary
} from '../../reducers/modals';
import {
    activateLesson,
    viewLessons
} from '../../reducers/studioLessons';
import {setPlayer} from '../../reducers/mode';
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    getIsManualUpdating,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen
} from '../../reducers/menus';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import feedbackIcon from './icon--feedback.svg';
import profileIcon from './icon--profile.png';
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';
import aboutIcon from './icon--about.svg';

import sharedMessages from '../../lib/shared-messages';

import {onSharing} from '../../reducers/itch-project';
import directionIcon from './directions.png';
import ITCH_CONFIG from "../../../itch.config";

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    },
    itchLessons: {
        id: 'itchLocale.menuBar.itchLessons',
        defaultMessage: 'Lessons from iTCH',
        description: 'accessibility text for the lessons button'
    },
    saveNow: {
        id: 'gui.menuBar.saveNowLink',
        defaultMessage: 'Save Now',
        description: 'Title bar link for saving now'
    },
    saving: {
        id: 'itchLocale.menuBar.projectIsSaving',
        defaultMessage: 'Saving...',
        description: 'accessibility text save button on saving state'
    },
    saved: {
        id: 'gui.alerts.savesuccess',
        defaultMessage: 'Project saved.',
        description: 'Message indicating that project was successfully saved'
    }
});
const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};


MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

const AboutButton = props => (
    <Button
        className={classNames(styles.menuBarItem, styles.hoverable)}
        iconClassName={styles.aboutIcon}
        iconSrc={aboutIcon}
        onClick={props.onClick}
    />
);

AboutButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickNew',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'handleItchLesson'
        ]);
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }
    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare () {
        if (!this.props.isShared) {
            if (this.props.canShare) {
                this.props.onShare();
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    handleItchLesson (){
        /* this.props.onProjectLessons(0, null); */
        this.props.onViewLessons();
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    render () {
        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        const itchLessonButton = (
            <div
                aria-label={this.props.intl.formatMessage(ariaMessages.itchLessons)}
                className={classNames(styles.menuBarItem, styles.hoverable)}
                onClick={this.handleItchLesson}
            >
                <img
                    className={styles.lessonIcon}
                    draggable={false}
                    src={directionIcon}
                />
                <FormattedMessage
                    defaultMessage="View directions"
                    description="Text for itch directions button"
                    id="itchLocale.cards.directions"
                />
            </div>
        );
        const itchSaveButton = (
            <Button
                className={classNames(styles.saveButton)}
                disabled={this.props.isUpdating}
                onClick={this.props.onClickSave}
            >
                {
                    this.props.projectChanged ? this.props.intl.formatMessage(ariaMessages.saveNow) :
                        (this.props.isUpdating ? this.props.intl.formatMessage(ariaMessages.saving) :
                            this.props.intl.formatMessage(ariaMessages.saved)
                        )
                }
            </Button>

        );
        /* const remixButton = (
            <Button
                className={classNames(styles.shareButton)}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        ); */
        // Show the About button only if we have a handler for it (like in the desktop app)
        const aboutButton = this.props.onClickAbout ? <AboutButton onClick={this.props.onClickAbout} /> : null;
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >
                <div className={styles.mainMenu}>
                    <div className={styles.fileGroup}>
                        {/* <div className={classNames(styles.menuBarItem)}>
                            <img
                                alt="Scratch"
                                className={classNames(styles.scratchLogo, {
                                    [styles.clickable]: typeof this.props.onClickLogo !== 'undefined'
                                })}
                                draggable={false}
                                src={this.props.logo}
                                onClick={this.props.onClickLogo}
                            />
                        </div> */}
                        {(this.props.canChangeLanguage) && (<div
                            className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}
                        >
                            <div>
                                <img
                                    className={styles.languageIcon}
                                    src={languageIcon}
                                />
                                <img
                                    className={styles.languageCaret}
                                    src={dropdownCaret}
                                />
                            </div>
                            <LanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                        </div>)}

                        {(this.props.canSave ||
                            this.props.canCreateCopy ||
                            this.props.canRemix ||
                            this.props.canCreateNew ||
                            this.props.canUpload ||
                            this.props.canDownload
                        ) && (
                            <div
                                className={classNames(styles.menuBarItem, styles.hoverable, {
                                    [styles.active]: this.props.fileMenuOpen
                                })}
                                onMouseUp={this.props.onClickFile}
                            >
                                <FormattedMessage
                                    defaultMessage="File"
                                    description="Text for file dropdown menu"
                                    id="gui.menuBar.file"
                                />
                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.fileMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                    onRequestClose={this.props.onRequestCloseFile}
                                >
                                    {(this.props.canSave ||
                                        this.props.canCreateCopy ||
                                        this.props.canRemix ||
                                        this.props.canCreateNew) && (
                                        <MenuSection>
                                            {this.props.canCreateNew ? (
                                                <MenuItem
                                                    isRtl={this.props.isRtl}
                                                    onClick={this.handleClickNew}
                                                >
                                                    {newProjectMessage}
                                                </MenuItem>
                                            ) : []}
                                            {this.props.canSave ? (
                                                <MenuItem onClick={this.handleClickSave}>
                                                    {saveNowMessage}
                                                </MenuItem>
                                            ) : []}
                                            {this.props.canCreateCopy ? (
                                                <MenuItem onClick={this.handleClickSaveAsCopy}>
                                                    {createCopyMessage}
                                                </MenuItem>
                                            ) : []}
                                            {this.props.canRemix ? (
                                                <MenuItem onClick={this.handleClickRemix}>
                                                    {remixMessage}
                                                </MenuItem>
                                            ) : []}
                                        </MenuSection>
                                    )}
                                    {this.props.canUpload || this.props.canDownload ? (
                                        <MenuSection>
                                            {this.props.canUpload ? (
                                                <SBFileUploader
                                                    canSave={this.props.canSave}
                                                    userOwnsProject={this.props.userOwnsProject}>
                                                    {(className, renderFileInput, loadProject) => (
                                                        <MenuItem
                                                            className={className}
                                                            onClick={loadProject}
                                                        >
                                                            {this.props.intl.formatMessage(sharedMessages.loadFromComputerTitle)}
                                                            {renderFileInput()}
                                                        </MenuItem>
                                                    )}
                                                </SBFileUploader>
                                            ) : []}
                                            {this.props.canDownload ? (
                                                <SB3Downloader>{(className, downloadProjectCallback) => (
                                                    <MenuItem
                                                        className={className}
                                                        onClick={this.handleSaveToComputer(downloadProjectCallback)}
                                                    >
                                                        <FormattedMessage
                                                            defaultMessage="Save to your computer"
                                                            description="Menu bar item for downloading a project to your computer"
                                                            id="gui.menuBar.downloadToComputer"
                                                        />
                                                    </MenuItem>
                                                )}</SB3Downloader>
                                            ) : []}
                                        </MenuSection>
                                    ) : null}

                                </MenuBarMenu>
                            </div>
                        )}
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.editMenuOpen
                            })}
                            onMouseUp={this.props.onClickEdit}
                        >
                            <div className={classNames(styles.editMenu)}>
                                <FormattedMessage
                                    defaultMessage="Edit"
                                    description="Text for edit dropdown menu"
                                    id="gui.menuBar.edit"
                                />
                            </div>
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.editMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                                onRequestClose={this.props.onRequestCloseEdit}
                            >
                                <DeletionRestorer>{(handleRestore, {restorable, deletedItem}) => (
                                    <MenuItem
                                        className={classNames({[styles.disabled]: !restorable})}
                                        onClick={this.handleRestoreOption(handleRestore)}
                                    >
                                        {this.restoreOptionMessage(deletedItem)}
                                    </MenuItem>
                                )}</DeletionRestorer>
                                <MenuSection>
                                    <TurboMode>{(toggleTurboMode, {turboMode}) => (
                                        <MenuItem onClick={toggleTurboMode}>
                                            {turboMode ? (
                                                <FormattedMessage
                                                    defaultMessage="Turn off Turbo Mode"
                                                    description="Menu bar item for turning off turbo mode"
                                                    id="gui.menuBar.turboModeOff"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    defaultMessage="Turn on Turbo Mode"
                                                    description="Menu bar item for turning on turbo mode"
                                                    id="gui.menuBar.turboModeOn"
                                                />
                                            )}
                                        </MenuItem>
                                    )}</TurboMode>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    {/*<div
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        <FormattedMessage {...ariaMessages.tutorials} />
                    </div>
                    <Divider className={classNames(styles.divider)} />*/}
                    {this.props.canSeeItchLessons ? itchLessonButton : null}
                    {this.props.canEditTitle ? (
                        <div className={classNames(styles.menuBarItem, styles.growable)}>
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(styles.titleFieldGrowable)}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                        />
                    ) : null)}
                    {/* <div className={classNames(styles.menuBarItem, styles.growable)}>
                        <MenuBarItemTooltip
                            enable
                            id="title-field"
                        >
                            <ProjectTitleInput
                                className={classNames(styles.titleFieldGrowable)}
                                onUpdateProjectTitle={this.props.onUpdateProjectTitle}
                            />
                        </MenuBarItemTooltip>
                    </div> */}
                    <div className={classNames(styles.menuBarItem)}>
                        {this.props.canShare && (
                            (this.props.isShowingProject || this.props.isUpdating) && (
                                <ProjectWatcher onDoneUpdating={this.props.onSeeCommunity}>
                                    {
                                        waitForUpdate => (
                                            <ShareButton
                                                className={styles.menuBarButton}
                                                isShared={this.props.isShared}
                                                /* eslint-disable react/jsx-no-bind */
                                                onClick={() => {
                                                    this.handleClickShare(waitForUpdate);
                                                }}
                                                /* eslint-enable react/jsx-no-bind */
                                            />
                                        )
                                    }
                                </ProjectWatcher>
                            )
                        )}
                    </div>
                    <div className={classNames(styles.menuBarItem)}>
                        {this.props.canSave ? itchSaveButton : (this.props.canRemix ? remixButton : [])}
                    </div>
                    {/* <div className={classNames(styles.menuBarItem)}>
                        {this.props.canRemix ? remixButton : null}
                    </div> */}
                    {/* <div className={classNames(styles.menuBarItem, styles.communityButtonWrapper)}>
                        {this.props.enableCommunity ?
                            <Button
                                className={classNames(styles.communityButton)}
                                iconClassName={styles.communityButtonIcon}
                                iconSrc={communityIcon}
                                onClick={this.props.onSeeCommunity}
                            >
                                <FormattedMessage
                                    defaultMessage="See Community"
                                    description="Label for see community button"
                                    id="gui.menuBar.seeCommunity"
                                />
                            </Button>
                        ) : (this.props.showComingSoon ? (
                            <MenuBarItemTooltip id="community-button">
                                <CommunityButton className={styles.menuBarButton} />
                            </MenuBarItemTooltip>
                        }
                    </div> */}
                </div>

                {/* show the proper UI in the account menu, given whether the user is
                logged in, and whether a session is available to log in with */}
                <div className={styles.accountInfoGroup}>
                    <div className={styles.menuBarItem}>
                        {this.props.canSave && (
                            <SaveStatus />
                        )}
                    </div>
                    {this.props.sessionExists ? (
                        this.props.username ? (
                            // ************ user is logged in ************
                            <React.Fragment>
                                { this.props.feedbackVisible  && (
                                 <div className={classNames(styles.menuBarItem, styles.feedbackButtonWrapper)}>
                                    <a
                                        className={styles.feedbackLink}
                                        href="https://docs.google.com/forms/d/e/1FAIpQLScRjrOVVgR47D3-vHYUaR5EWr1B148pv4d9L8sfg2tMV3lOGQ/viewform"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <Button
                                            className={styles.feedbackButton}
                                            iconSrc={feedbackIcon}
                                        >
                                            <FormattedMessage
                                                defaultMessage="Give Feedback"
                                                description="Label for feedback form modal button"
                                                id="gui.menuBar.giveFeedback"
                                            />
                                        </Button>
                                    </a>
                                </div>
                                )}
                                {/* <MenuBarItemTooltip id="mystuff">
                                    <div
                                        className={classNames(
                                            styles.menuBarItem,
                                            styles.hoverable,
                                            styles.mystuffButton
                                        )}
                                    >
                                        <img
                                            className={styles.mystuffIcon}
                                            src={mystuffIcon}
                                        />
                                    </div>
                                </MenuBarItemTooltip> */}
                                <AccountNav
                                    className={classNames(
                                        styles.menuBarItem,
                                        /* styles.hoverable, */
                                        {[styles.active]: this.props.accountMenuOpen}
                                    )}
                                    isOpen={this.props.accountMenuOpen}
                                    isRtl={this.props.isRtl}
                                    menuBarMenuClassName={classNames(styles.menuBarMenu)}
                                    onClick={this.props.onClickAccount}
                                    onClose={this.props.onRequestCloseAccount}
                                    onLogOut={this.props.onLogOut}
                                />
                            </React.Fragment>
                        ) : []
                    ) : (
                        // ******** no login session is available, so don't show login stuff
                        <React.Fragment>
                            <div className={classNames(styles.menuBarItem, styles.feedbackButtonWrapper)}>
                                <a
                                    className={styles.feedbackLink}
                                    href="https://docs.google.com/forms/d/e/1FAIpQLScRjrOVVgR47D3-vHYUaR5EWr1B148pv4d9L8sfg2tMV3lOGQ/viewform"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <Button
                                        className={styles.feedbackButton}
                                        iconSrc={feedbackIcon}
                                    >
                                        <FormattedMessage
                                            defaultMessage="Give Feedback"
                                            description="Label for feedback form modal button"
                                            id="gui.menuBar.giveFeedback"
                                        />
                                    </Button>
                                </a>
                            </div>
                            {this.props.showComingSoon ? (
                                <React.Fragment>
                                    {/* <MenuBarItemTooltip id="mystuff">
                                        <div
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.mystuffButton
                                            )}
                                        >
                                            <img
                                                className={styles.mystuffIcon}
                                                src={mystuffIcon}
                                            />
                                        </div>
                                    </MenuBarItemTooltip> */}
                                    <MenuBarItemTooltip
                                        id="account-nav"
                                        place={this.props.isRtl ? 'right' : 'left'}
                                    >
                                        <div
                                            className={classNames(
                                                styles.menuBarItem,
                                                styles.hoverable,
                                                styles.accountNavMenu
                                            )}
                                        >
                                            <img
                                                className={styles.profileIcon}
                                                src={profileIcon}
                                            />
                                            <span>
                                                {'scratch-cat'}
                                            </span>
                                            <img
                                                className={styles.dropdownCaretIcon}
                                                src={dropdownCaret}
                                            />
                                        </div>
                                    </MenuBarItemTooltip>
                                </React.Fragment>
                            ) : []}
                        </React.Fragment>
                    )}
                </div>

                {/*{aboutButton}*/}
            </Box>
        );
    }
}

MenuBar.propTypes = {
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canDownload: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    canSeeItchLessons: PropTypes.bool,
    canUpload: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    feedbackVisible: PropTypes.bool,
    intl: intlShape,
    isLoggedIn: PropTypes.bool,
    isManualUpdating: PropTypes.bool,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isUpdating: PropTypes.bool,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    onClickAbout: PropTypes.func,
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectLessons: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    onUpdateProjectTitle: PropTypes.func,
    onViewLessons: PropTypes.func,
    projectChanged: PropTypes.bool,
    projectTitle: PropTypes.string,
    renderLogin: PropTypes.func,
    saveText: PropTypes.number,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

MenuBar.defaultProps = {
    //logo: scratchLogo,
    onShare: () => {}
};
const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session && state.session.session && state.session.session.user;
    const saveText = getIsUpdating(loadingState) ? 1 :
        state.scratchGui.projectState.needsUpdate ? 2 : 0;

    /**
     * 0 means that is on state saved
     * 1 means that is on state saving
     * 2 means that is on state not saved
     */

    let isWizard = false;
    let isPreview = false;
    let feedbackVisible = true;
    if (ITCH_CONFIG.ITCH_LESSONS && typeof window.getScratchItchConfig === 'function'){
        const configs = window.getScratchItchConfig();
        isWizard = configs.isWizard;
        feedbackVisible = configs.feedbackVisible;
        isPreview = configs.isPreview;
    }
    const userOwnsProject = state.scratchGui.itchProject.projectUser !== null &&
        typeof state.session.session.user !== 'undefined' &&
        typeof state.session.session.user.id !== 'undefined' &&
        state.session.session.user.id === state.scratchGui.itchProject.projectUser;
    return {
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isRtl: state.locales.isRtl,
        isUpdating: getIsUpdating(loadingState),
        isShowingProject: getIsShowingProject(loadingState),
        isManualUpdating: getIsManualUpdating(loadingState),
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        sessionExists: state.session && typeof state.session.session !== 'undefined',
        username: user ? user.username : null,
        saveText,
        userOwnsProject,
        vm: state.scratchGui.vm,
        projectChanged: state.scratchGui.projectChanged,
        canSeeItchLessons: state.scratchGui.studioLessons.content.length > 0 && (!isWizard || isPreview),
        feedbackVisible: feedbackVisible,
    };
};

const mapDispatchToProps = dispatch => ({
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true)),
    onShare: () => dispatch(onSharing()),
    onViewLessons: () => dispatch(viewLessons()),
    onProjectLessons: (step, callback) => dispatch(activateLesson(step, callback))
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
