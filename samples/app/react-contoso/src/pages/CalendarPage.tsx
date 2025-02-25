import * as React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Agenda, Get, PeoplePicker } from '@microsoft/mgt-react';
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { MgtTemplateProps } from '@microsoft/mgt-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { ArrowCircleLeft48Regular, ArrowCircleRight48Regular, ChevronDown48Regular, Delete24Regular, Edit24Regular } from '@fluentui/react-icons';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Add24Regular } from '@fluentui/react-icons';
import {
    SelectTabData,
    SelectTabEvent,
    Button,
    TabValue,
    shorthands,
    makeStyles,
    mergeClasses,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Field,
    Input,
    Textarea,
    Switch,
    Dropdown,
    Option
} from '@fluentui/react-components';
import { IconButton, ProgressIndicator } from '@fluentui/react';
import PubSub from 'pubsub-js';

initializeIcons();
const useStyles = makeStyles({
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
    },
    panels: {
        ...shorthands.padding('10px')
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%'
    },
    side: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%'
    },
    navigation: {
        display: 'flex',
        flexDirection: 'column'
    },
    mainButton: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '4vh'
    },

    loadingMessage: {
        paddingLeft: '10px'
    },
});

let getAPIcontent: Array<{ api: string; type: string; }> = [];
export const CalendarPage: React.FunctionComponent = () => {
    const styles = useStyles();
    const [selectedTab, setSelectedTab] = React.useState<TabValue>('focused');
    const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
    const nextDateItme = new Date();
    const MondayGet = nextDateItme.setDate(nextDateItme.getDate() - nextDateItme.getDay() + 1)
    const today = new Date();
    let startdatetimeData = new Date(MondayGet).toISOString().substr(0, 10);
    let enddatetimeData = new Date(new Date(MondayGet).setDate(new Date(MondayGet).getDate() + 6)).toISOString().substr(0, 10);

    const [getEnd, setEnddatetimeData] = useState(enddatetimeData);
    const [getStart, setStartdatetimeData] = useState(startdatetimeData);
    const newEndDate = new Date(getEnd);
    newEndDate.setDate(newEndDate.getDate() + 1);
    const updatedEnddatetimeData = newEndDate.toISOString().substr(0, 10);
    const [refreshKey, setRefreshKey] = useState(0);
    const [butNex, buttonTime] = useState(1);

    const [showApiModal, setShowApiModal] = useState(true);
    const [getHandleRemoveAPI, setHandleRemoveAPI] = useState(false);
    const APIcontent = (message) => {
        getAPIcontent.push(message);
    };
    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        setSelectedTab(data.value);
    };
    const [getToken, setToken] = React.useState("");
    Providers.globalProvider.getAccessToken().then(result => {
        // Get token
        setToken(result);
    }).catch(error => {
        console.error("Promise 发生错误:", error);
    });
    const CalendarTemplate: React.FC<CalendarTemplateProps> = ({ onEventReceived, dataContext }) => {

        const [isLoading, setIsLoading] = useState(false); //Loading...
        const currentEvent = dataContext.event;
        const [data, setData] = useState(false);
        let showClickMe = currentEvent.location.uniqueId === "Microsoft Teams Meeting";
        Providers.globalProvider.setState(ProviderState.SignedIn);
        // Get Token
        const token = Providers.globalProvider.getAccessToken();
        const options = {
            authProvider: done => {
                done(null, token);
            }
        };
        const client = Client.init(options);
        useEffect(() => {
            if (currentEvent.location.uniqueId === "Microsoft Teams Meeting") {
                let joinUrl = currentEvent.onlineMeeting.joinUrl;
                const onlineMeetings = client
                    .api('me/onlineMeetings')
                    .filter(`joinWebUrl eq '${joinUrl}'`)
                    .get().then(response => {
                        const meeting = response.value[0];
                        const userId = meeting.participants.organizer.identity.user.id;
                        if (response && response.value.length > 0) {
                            const meeting = response.value[0];
                            const meetingId = meeting.id;
                            const transcripts = client.api(`me/onlineMeetings/${meetingId}/transcripts`).get()
                                .then(responses => {
                                    if (responses.value.length > 0) {
                                        setData(true);
                                    }
                                })
                                .catch(error => {
                                    console.error("An error occurred, and ignore it:", error);
                                });
                        }
                    })
            }
        }, []);

        const buttonHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                if (data) {
                    setIsLoading(false);
                }
            }, 8888);
            let getAPIcontent: Array<{ api: string; type: string; }> = [];
            event.preventDefault();
            Providers.globalProvider.setState(ProviderState.SignedIn);
            // Get Token
            const token = await Providers.globalProvider.getAccessToken();
            const options = {
                authProvider: done => {
                    done(null, token);
                }
            };
            const client = Client.init(options);
            let joinUrl = currentEvent.onlineMeeting.joinUrl;
            // get onlineMeetingID
            const onlineMeetings = await client
                .api('me/onlineMeetings')
                .filter(`joinWebUrl eq '${joinUrl}'`)
                .get();
            let apiCon = [{
                api: "https://graph.microsoft.com/me/onlineMeetings?$filter=joinWebUrl eq '" + joinUrl + "'",
                type: "GET"
            }];
            PubSub.publish("Calendar", apiCon);
            const meeting = onlineMeetings.value[0];
            const userId = meeting.participants.organizer.identity.user.id;
            if (onlineMeetings && onlineMeetings.value.length > 0) {
                const meeting = onlineMeetings.value[0];
                const meetingId = meeting.id;
                const transcripts = await client.api(`me/onlineMeetings/${meetingId}/transcripts`).get();
                let apiCon = [{
                    api: "https://graph.microsoft.com/me/onlineMeetings/" + meetingId + "/transcripts'",
                    type: "GET"
                }];

                PubSub.publish("Calendar", apiCon);
                if (transcripts && transcripts.value.length > 0) {
                    const transcriptId = transcripts.value[0].id;
                    const transcriptContentUrl = transcripts.value[0].transcriptContentUrl;
                    //get Summary
                    const axios = require('axios');
                    const getTranscriptContent = async () => {
                        try {
                            let apiCon = [{
                                api: `https://graph.microsoft.com/beta/users/${userId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`,
                                type: "GET"
                            }];

                            PubSub.publish("Calendar", apiCon);
                            const response = await axios.get(
                                `https://graph.microsoft.com/beta/users/${userId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    },
                                    responseType: 'text'
                                }
                            );
                            const content = response.data;
                            return content;
                        } catch (error) {
                            console.error(error);
                            return null;
                        }
                    };
                    const generateSummary = async () => {
                        const transcriptContent = await getTranscriptContent();
                        if (!transcriptContent) {
                            alert('Failed to retrieve transcript content');
                            console.log('Failed to retrieve transcript content');
                            return;
                        } else {
                            console.log('Successfully get transcript content');
                        }
                        const context = {
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are an AI assistant that helps people find information.'
                                },
                                {
                                    role: 'user',
                                    content: `Summarize what I've missed and list the action items in bullet points from this transcript, content at here: ${transcriptContent}`
                                }
                            ],
                            temperature: 0.7,
                            top_p: 0.95,
                            frequency_penalty: 0,
                            presence_penalty: 0,
                            max_tokens: 800,
                            stop: null
                        };
                        try {
                            let apiUrl = `https://${process.env.REACT_APP_OPENAI_RES_NAME}.openai.azure.com/openai/deployments/${process.env.REACT_APP_OPENAI_DEPLOY_ID}/chat/completions?api-version=2024-05-01-preview`
                            let apiCon = [{
                                api: apiUrl,
                                type: "POST"
                            }];
                            PubSub.publish("Calendar", apiCon);
                            onEventReceived(apiCon);
                            const response = await axios.post(apiUrl, context,
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'api-key': process.env.REACT_APP_OPENAI_API_KEY
                                    }
                                }
                            );
                            const generatedAnswer = response.data.choices[0].message.content;
                            alert(generatedAnswer);

                        } catch (error) {
                            console.error(error);
                        }
                    };
                    generateSummary();
                } else {
                    console.log('No transcripts found');
                    onEventReceived(apiCon);
                }
            } else {
                console.log('No online meetings found');
                alert('No online meetings found');
                onEventReceived(apiCon);
                return null;
            }
        };

        const handleDeleteEvent = async (eventId: string) => {
            try {
                Providers.globalProvider.setState(ProviderState.SignedIn);
                const token = await Providers.globalProvider.getAccessToken();
                const options = {
                    authProvider: done => {
                        done(null, token);
                    }
                };
                const client = Client.init(options);

                // Call the delete API
                await client.api(`/me/calendar/events/${eventId}`).delete();

                // Publish the API call for tracking
                let apiCon = [{
                    api: `https://graph.microsoft.com/v1.0/me/calendar/events/${eventId}`,
                    type: "DELETE"
                }];
                PubSub.publish("Calendar", apiCon);
                onEventReceived(apiCon);
                setRefreshKey(prev => prev + 1); // Refresh calendar
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event');
            }
        };

        return (
            <div style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)" }} className="clickButton" >
                {showClickMe && data.valueOf() && (
                    <button
                        style={{ fontSize: '20px', color: 'black', width: "200px", height: "30px", border: "none", textAlign: "center", backgroundColor: "#dadada", borderRadius: "24px" }}
                        type="submit"
                        onClick={buttonHandler}
                    >
                        {isLoading ? (
                            <ProgressIndicator label="Loading..." />
                        ) : (
                            "Meeting Summary"
                        )}
                    </button>
                )}
                <Button
                    icon={<Edit24Regular />}
                    appearance="subtle"
                    style={{
                        padding: '4px'
                    }}
                    onClick={() => {
                        // 预填充当前事件数据
                        setFormData({
                            eventId: currentEvent.id,
                            subject: currentEvent.subject,
                            body: currentEvent.body?.content || '',
                            startDate: new Date(currentEvent.start.dateTime).toISOString().split('T')[0],
                            startTime: new Date(currentEvent.start.dateTime).toTimeString().split(' ')[0].substring(0, 5),
                            endDate: new Date(currentEvent.end.dateTime).toISOString().split('T')[0],
                            endTime: new Date(currentEvent.end.dateTime).toTimeString().split(' ')[0].substring(0, 5),
                            location: currentEvent.location?.displayName || '',
                            attendees: currentEvent.attendees
                                ?.filter(a => a.type === "required")
                                ?.map(a => ({
                                    address: a.emailAddress.address,
                                    name: a.emailAddress.name,
                                })) || [],
                            optionAttendees: currentEvent.attendees
                                ?.filter(a => a.type !== "required")
                                ?.map(a => ({
                                    address: a.emailAddress.address,
                                    name: a.emailAddress.name,
                                })) || [],
                            isOnlineMeeting: currentEvent.isOnlineMeeting || false,
                            onlineMeetingProvider: currentEvent.onlineMeetingProvider || 'teamsForBusiness'
                        });
                        setIsDialogOpen(true);
                    }}
                />
                <Button
                    icon={<Delete24Regular />}
                    appearance="subtle"
                    style={{
                        padding: '4px'
                    }}
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                            handleDeleteEvent(currentEvent.id);
                        }
                    }}
                />
            </div>
        );
    };

    const handleNextCalendar = () => {
        const nextDate = new Date(getEnd);
        nextDate.setUTCDate(nextDate.getUTCDate() + 7); // 增加7天
        buttonTime(1);
        const enddatetimeData = nextDate.toISOString().substr(0, 10);
        setEnddatetimeData(enddatetimeData);
        const startdatetime = new Date(getEnd);
        startdatetime.setDate(startdatetime.getDate() + 1);
        const startdatetimeData = startdatetime.toISOString().substr(0, 10);
        setStartdatetimeData(startdatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET"
        }];
        console.log("Calendar", apiCo);
        PubSub.publish("Calendar", apiCo);
    };

    const handlePreviousCalendar = () => {
        const previousDate = new Date(getStart);
        previousDate.setDate(previousDate.getDate() - 7); // PreWeek
        buttonTime(0);
        const startdatetimeData = previousDate.toISOString().substr(0, 10);
        setStartdatetimeData(startdatetimeData);

        const enddatetimeData = new Date(previousDate);
        enddatetimeData.setDate(enddatetimeData.getDate() + 6);
        const enddatetimeDataFormatted = enddatetimeData.toISOString().substr(0, 10);
        setEnddatetimeData(enddatetimeDataFormatted); //Modify Format
        setRefreshKey(refreshKey + 1);
        let apiCo = [
            {
                api:
                    "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" +
                    startdatetimeData +
                    "&enddatetime=" +
                    enddatetimeDataFormatted,
                type: "GET",
            },
        ];
        PubSub.publish("Calendar", apiCo);
    };

    const handleToday = () => {
        const today = new Date();
        const thisWeek = today.getUTCDate() - today.getUTCDay() + 1; // Monday
        const startdatetimeData = new Date(today.setUTCDate(thisWeek)).toISOString().substr(0, 10);
        setStartdatetimeData(startdatetimeData);
        const enddatetimeData = new Date(today.setUTCDate(thisWeek + 6)).toISOString().substr(0, 10); // Sunday
        setEnddatetimeData(enddatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET"
        }];
        PubSub.publish("Calendar", apiCo);
    };

    // Close And Clear APIContent
    const handleRemoveAPI = () => {
        setHandleRemoveAPI(false);
    };

    React.useEffect(() => {
        enddatetimeData = getEnd;
        startdatetimeData = getStart;
    }, [currentDate, butNex, getEnd, getStart]);
    //send data
    React.useEffect(() => {
        //send and show calendar All API 
        let apiCo = [{
            api: "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET"
        }];
        PubSub.publish("Calendar", apiCo);
        const subscriptionToken = PubSub.subscribe('ClearAPIdata', async (topic, data) => {
            getAPIcontent = [];
        });
        return () => {
            PubSub.unsubscribe(subscriptionToken);
        };
    }, [])

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    interface Attendee {
        address: string;
        name: string;
    }

    const [formData, setFormData] = useState<{
        eventId: string | undefined;
        subject: string;
        body: string;
        startDate: string;
        startTime: string;
        endDate: string;
        endTime: string;
        location: string;
        attendees: Attendee[];
        optionAttendees: Attendee[];
        isOnlineMeeting: boolean;
        onlineMeetingProvider: string;
    }>({
        eventId: undefined,
        subject: '',
        body: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        attendees: [],
        optionAttendees: [],
        isOnlineMeeting: false,
        onlineMeetingProvider: 'teamsForBusiness'
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        const event = {
            subject: formData.subject,
            body: {
                contentType: "HTML",
                content: formData.body
            },
            start: {
                dateTime: `${formData.startDate}T${formData.startTime}`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: `${formData.endDate}T${formData.endTime}`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            location: {
                displayName: formData.location
            },
            attendees: [
                ...formData.attendees.map(attendee => ({
                    emailAddress: {
                        address: attendee.address,
                        name: attendee.name,
                    },
                    type: "required",
                })),
                ...formData.optionAttendees.map(attendee => ({
                    emailAddress: {
                        address: attendee.address,
                        name: attendee.name,
                    },
                    type: "optional",
                }))
            ],
            isOnlineMeeting: formData.isOnlineMeeting,
            onlineMeetingProvider: formData.onlineMeetingProvider
        };

        try {
            const provider = Providers.globalProvider;
            const graph = provider.graph;
            const eventId = formData.eventId;
            if (eventId) {
                const response = await graph.api(`/me/calendar/events/${eventId}`)
                    .patch(event);
            }
            else {
                const response = await graph.api('/me/calendar/events')
                    .post(event);
            }
            setIsDialogOpen(false);
            setRefreshKey(prev => prev + 1); // Refresh calendar
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };


    return (
        <>
            <div style={{ display: "flex" }}>
                <div style={{ width: "98%", lineHeight: "30px", height: "100%" }}>
                    <PageHeader
                        title={'Calendar'}
                        description={'Stay productive and navigate your calendar appointments'}
                    ></PageHeader>
                    <div className={styles.container}>
                        <div className={styles.mainButton}>
                            <Button appearance='transparent' className="to_left" icon={<ArrowCircleLeft48Regular />} style={{ fontSize: '20px' }}
                                onClick={handlePreviousCalendar}
                            >Previous week</Button>
                            <Button appearance='transparent' style={{ fontSize: '20px' }} icon={<ChevronDown48Regular />} onClick={handleToday}
                            >Today</Button>
                            <Button appearance='transparent' icon={<ArrowCircleRight48Regular />} style={{ float: "right", fontSize: '20px' }} onClick={handleNextCalendar}
                            >Next week</Button>
                        </div>
                        <div className={mergeClasses(styles.panels, styles.main)}>
                            <Agenda groupByDay={true} id="my-calendar"
                                key={refreshKey}
                                eventQuery={`/me/calendarview?$orderby=start/dateTime&startdatetime=${getStart}&enddatetime=${getEnd}`} >
                                <CalendarTemplate template="event-other" onEventReceived={APIcontent} ></CalendarTemplate>
                            </Agenda>
                            <Dialog open={isDialogOpen} onOpenChange={(e, data) => setIsDialogOpen(data.open)}>
                                <DialogTrigger>
                                    <Button
                                        icon={<Add24Regular />}
                                        appearance="primary"
                                        style={{
                                            width: '100%',
                                            marginTop: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        onClick={() => {
                                            setFormData({
                                                eventId: undefined,
                                                subject: '',
                                                body: '',
                                                startDate: '',
                                                startTime: '',
                                                endDate: '',
                                                endTime: '',
                                                location: '',
                                                attendees: [],
                                                optionAttendees: [],
                                                isOnlineMeeting: false,
                                                onlineMeetingProvider: 'teamsForBusiness'
                                            });
                                        }}
                                    >
                                        Add Agenda
                                    </Button>
                                </DialogTrigger>
                                <DialogSurface>
                                    <DialogBody>
                                        <DialogTitle>
                                            {formData.eventId ? 'Update Event' : 'Create New Event'}
                                        </DialogTitle>
                                        <DialogContent>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <Field label="Subject">
                                                    <Input
                                                        value={formData.subject}
                                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                                    />
                                                </Field>
                                                <Field label="Description">
                                                    <Textarea
                                                        value={formData.body}
                                                        onChange={(e) => handleInputChange('body', e.target.value)}
                                                    />
                                                </Field>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <Field label="Start Date">
                                                        <Input
                                                            type="date"
                                                            value={formData.startDate}
                                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label="Start Time">
                                                        <Input
                                                            type="time"
                                                            value={formData.startTime}
                                                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                                                        />
                                                    </Field>
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <Field label="End Date">
                                                        <Input
                                                            type="date"
                                                            value={formData.endDate}
                                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                                        />
                                                    </Field>
                                                    <Field label="End Time">
                                                        <Input
                                                            type="time"
                                                            value={formData.endTime}
                                                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                                                        />
                                                    </Field>
                                                </div>
                                                <Field label="Location">
                                                    <Input
                                                        value={formData.location}
                                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                                    />
                                                </Field>
                                                <Field label="Required Attendees">
                                                    <PeoplePicker
                                                        defaultSelectedUserIds={
                                                            formData.attendees
                                                                .map(a => a.address)
                                                        }
                                                        selectionChanged={(e) => {
                                                            const peoples = e.detail;
                                                            const attendees: Attendee[] = [];
                                                            for (let people of peoples) {
                                                                if (people.id && people.displayName) {
                                                                    const obj: Attendee = { address: people.id, name: people.displayName };
                                                                    attendees.push(obj);
                                                                }
                                                            }
                                                            handleInputChange('attendees', attendees);
                                                        }
                                                        }></PeoplePicker>
                                                </Field>
                                                <Field label="Optional Attendees">
                                                    <PeoplePicker
                                                        defaultSelectedUserIds={
                                                            formData.optionAttendees
                                                                .map(a => a.address)
                                                        }
                                                        selectionChanged={(e) => {
                                                            const peoples = e.detail;
                                                            const attendees: Attendee[] = [];
                                                            for (let people of peoples) {
                                                                if (people.id && people.displayName) {
                                                                    const obj: Attendee = { address: people.id, name: people.displayName };
                                                                    attendees.push(obj);
                                                                }
                                                            }
                                                            handleInputChange('optionAttendees', attendees);
                                                        }
                                                        }></PeoplePicker>
                                                </Field>
                                                <Field label="Online Meeting">
                                                    <Switch
                                                        checked={formData.isOnlineMeeting}
                                                        onChange={(e) => handleInputChange('isOnlineMeeting', e.target.checked)}
                                                    />
                                                </Field>
                                                <Field label="Meeting Provider">
                                                    <Dropdown
                                                        disabled={!formData.isOnlineMeeting}
                                                        value={formData.onlineMeetingProvider}
                                                        onActiveOptionChange={(_, data) => {
                                                            if (data?.nextOption?.value) {
                                                                handleInputChange('onlineMeetingProvider', data.nextOption.value)
                                                            }
                                                        }}
                                                    >
                                                        <Option value="teamsForBusiness">Microsoft Teams</Option>
                                                        <Option value="skypeForBusiness">Skype for Business</Option>
                                                    </Dropdown>
                                                </Field>
                                            </div>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button appearance="primary" onClick={handleSubmit}>
                                                {formData.eventId ? 'Update Event' : 'Create Event'}
                                            </Button>
                                        </DialogActions>
                                    </DialogBody>
                                </DialogSurface>
                            </Dialog>
                        </div>
                    </div>
                </div>
                {getHandleRemoveAPI && <div style={{ width: "800px", lineHeight: "30px", height: "100%", border: "1px solid #000", padding: "5px" }}>
                    <IconButton onClick={() => handleRemoveAPI()} iconProps={{ iconName: 'Cancel' }} style={{ fontSize: '20px', color: 'black', float: 'right' }} />
                    <button style={{ fontSize: '15px', color: 'black', width: "80px", height: "20px", border: "none", textAlign: "center", backgroundColor: "#dadada", borderRadius: "24px" }} >Clear</button>
                    <p></p>
                    {getAPIcontent.map((tag, index) => (
                        <div key={index}>
                            {tag.type === 'GET' || tag.type === 'POST' ? <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px" }}>
                                <span><b>{tag.type}</b></span>
                                <p style={{ margin: "0px", wordBreak: "break-all" }}><b>api:</b>{tag.api}</p>
                            </div> : ""
                            }
                        </div>
                    ))}
                </div>}
            </div>
        </>
    );
};
//Click Me_Button

interface CalendarTemplateProps extends MgtTemplateProps {
    onEventReceived: (event: any) => void;
}
