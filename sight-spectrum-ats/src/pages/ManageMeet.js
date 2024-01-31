import { PrimaryButton, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageMeet = () => {
    const navigateTo = useNavigate();
    const [meetingLink, setMeetingLink] = useState('');

    const handleJoinButtonClick = () => {
        window.location.assign(meetingLink);
        setMeetingLink('');
    };

    const openMeet = () => {
        navigateTo('/room');
    };

    return (
        <div>
            <div id="start-meeting">
                <PrimaryButton onClick={openMeet}>New Meeting</PrimaryButton>
            </div>

            <div id="join-meeting">
                <TextField
                    label="Meeting Link"
                    value={meetingLink}
                    onChange={(e, newValue) => setMeetingLink(newValue)}
                />
                <PrimaryButton onClick={handleJoinButtonClick}>Join Meeting</PrimaryButton>
            </div>
        </div>
    );
};

export default ManageMeet;
