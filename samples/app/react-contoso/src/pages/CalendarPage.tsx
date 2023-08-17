import * as React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Agenda, Get } from '@microsoft/mgt-react';
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { MgtTemplateProps } from '@microsoft/mgt-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon } from '@fluentui/react/lib/Icon';

import {
    SelectTabData,
    SelectTabEvent,
    Tab,
    TabList,
    TabValue,
    shorthands,
    makeStyles,
    mergeClasses
} from '@fluentui/react-components';

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
    }
});

export const CalendarPage: React.FunctionComponent = () => {
    const styles = useStyles();
    const [selectedTab, setSelectedTab] = React.useState<TabValue>('focused');
    const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
    const nextDateItme = new Date();
    const MondayGet = nextDateItme.setDate(nextDateItme.getDate() - nextDateItme.getDay() + 1)
    let startdatetimeData = new Date(MondayGet).toISOString().substr(0, 10);
    let enddatetimeData = new Date(new Date(MondayGet).setDate(new Date(MondayGet).getDate() + 6)).toISOString().substr(0, 10);
    const [refreshKey, setRefreshKey] = useState(0);
    const [butNex, buttonTime] = useState(1);
    const [eventQuery, setEnddatetimeData] = useState(enddatetimeData);
    const [eventQuery2, setStartdatetimeData] = useState(startdatetimeData);
    const [showApiModal, setShowApiModal] = useState(true);
    const [getAPIcontent, setAPIcontent] = useState(Array<{ api: string; type: string; }>);
    const [getHandleRemoveAPI, setHandleRemoveAPI] = useState(false);
    /* const [isTextBoxOpen, setIsTextBoxOpen] = useState(true);*/
    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        setSelectedTab(data.value);
    };
    const token = "";
    const [getToken, setToken] = React.useState("");
    Providers.globalProvider.getAccessToken().then(result => {
        // Get token
        setToken(result);
    }).catch(error => {
        console.error("Promise 发生错误:", error);
    });

    const handleNextCalendar = () => {
        const nextDate = new Date(enddatetimeData);
        nextDate.setDate(nextDate.getDate() + 7); //NextWeek
        // setCurrentDate(nextDate);
        buttonTime(1);
        startdatetimeData = enddatetimeData;
        enddatetimeData = new Date(nextDate).toISOString();
        setEnddatetimeData(enddatetimeData);
        setStartdatetimeData(startdatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET",

        }]
        getAPIcontent.push(apiCo[0])
        setHandleRemoveAPI(true);
    };

    const handlePreviousCalendar = () => {
        const previousDate = new Date(startdatetimeData);
        previousDate.setDate(previousDate.getDate() - 7); // PreWeek
        // setCurrentDate(previousDate);
        buttonTime(0);
        enddatetimeData = startdatetimeData;
        startdatetimeData = new Date(previousDate).toISOString();
        setEnddatetimeData(enddatetimeData);
        setStartdatetimeData(startdatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET",

        }]
        getAPIcontent.push(apiCo[0])
        setHandleRemoveAPI(true);
    };
    // 子组件触发父组件
    const APIcontent = (message) => {
        setAPIcontent(getAPIcontent => getAPIcontent.concat(message));
        setHandleRemoveAPI(true);
    };
    //Close APIContent
    const handleRemoveAPI = () => {
        setHandleRemoveAPI(false);
    }
    React.useEffect(() => {
        console.log('currentDate changed:', currentDate);
        enddatetimeData = eventQuery;
        startdatetimeData = eventQuery2;
    }, [currentDate, butNex, eventQuery, eventQuery2]);
    return (
        <>
            <div style={{ display: "flex" }}>
                <div style={{ width: "100%", lineHeight: "30px", height: "100%" }}>
                    <PageHeader
                        title={'Calendar'}
                        description={'Stay productive and navigate your calendar appointments'}
                    ></PageHeader>
                    <div className={styles.container}>
                        <div className={styles.side}>
                            <div className={styles.navigation}>
                                <div>
                                    <button onClick={handlePreviousCalendar} className="to_left" style={{ width: "200px", lineHeight: "30px", border: "none", backgroundColor: "#6c9ec5", borderRadius: "24px", color: "white", marginLeft: "90px" }}>
                                        <Icon iconName="ChevronLeft" style={{ marginRight: "5px" }} />
                                        <span style={{ fontSize: "16px" }}>Previous Week</span>
                                    </button>
                                    <button onClick={handleNextCalendar} style={{ float: "right", width: "200px", lineHeight: "30px", border: "none", backgroundColor: "#6c9ec5", borderRadius: "24px", color: "white", marginBottom: "10px", marginRight: "90px" }}>
                                        <span style={{ fontSize: "16px" }}>Next Week</span>
                                        <Icon iconName="ChevronRight" style={{ marginLeft: "5px" }} />
                                    </button>
                                </div>
                            </div>
                            <Agenda groupByDay={true} id="my-calendar"
                                key={refreshKey}
                                eventQuery={`/me/calendarview?$orderby=start/dateTime&startdatetime=${eventQuery2}&enddatetime=${eventQuery}`} >
                                <CalendarTemplate template="event-other" onEventReceived={APIcontent} ></CalendarTemplate>
                            </Agenda>
                        </div>
                    </div>
                </div>
                {getHandleRemoveAPI && <div style={{ width: "800px", lineHeight: "30px", height: "100%", border: "1px solid #000", padding: "20px" }}>
                    <button onClick={() => handleRemoveAPI()} style={{ backgroundColor: "#6c9ec5", borderRadius: "10px", color: "white", border: "none" }}>
                        <Icon iconName="Cancel" />
                    </button>
                    {getAPIcontent.map((tag, index) => (
                        <div key={index}>
                            {tag.type === 'GET' ? <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px" }}>
                                <span><b>{tag.type}</b></span>
                                <p style={{ margin: "0px", wordBreak: "break-all" }}><b>api:</b>https://graph.microsoft.com/v1.0{tag.api}</p>
                                <p style={{ margin: "20px 0 0", wordBreak: "break-all" }}></p>
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
;
interface CalendarTemplateProps extends MgtTemplateProps {
    onEventReceived: (event: any) => void;
}
const CalendarTemplate: React.FC<CalendarTemplateProps> = ({ onEventReceived, dataContext }) => {
    const currentEvent = dataContext.event;
    const [data, setData] = useState(true);
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
        // 调用接口，模拟异步获取数据
        if (currentEvent.location.uniqueId === "Microsoft Teams Meeting") {
            let joinUrl = currentEvent.onlineMeeting.joinUrl;
            const onlineMeetings = client
                .api('me/onlineMeetings')
                .version('beta')
                .filter(`joinWebUrl eq '${joinUrl}'`)
                .get().then(response => {
                    console.log(response)
                    const meeting = response.value[0];
                    const userId = meeting.participants.organizer.identity.user.id;
                    console.log(userId);
                    if (response && response.value.length > 0) {
                        const meeting = response.value[0];
                        const meetingId = meeting.id;
                        const transcripts = client.api(`me/onlineMeetings/${meetingId}/transcripts`).version('beta').get().then(responses => {
                            if (responses.value.length === 0) {
                                setData(false);
                            }
                        });
                    } else {
                        setData(true);
                    }
                })
        }
    }, []);

    const buttonHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
        let apiCon: Array<{ api: string; type: string; }> = [];
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
            .version('beta')
            .filter(`joinWebUrl eq '${joinUrl}'`)
            .get();
        apiCon.push({
            api: "/me/onlineMeetings?$filter=joinWebUrl eq '" + joinUrl + "'",
            type: "GET",

        })
        const meeting = onlineMeetings.value[0];
        const userId = meeting.participants.organizer.identity.user.id;
        console.log(userId);

        if (onlineMeetings && onlineMeetings.value.length > 0) {
            const meeting = onlineMeetings.value[0];
            const meetingId = meeting.id;
            const transcripts = await client.api(`me/onlineMeetings/${meetingId}/transcripts`).version('beta').get();
            apiCon.push({
                api: "/me/onlineMeetings/" + meetingId + "/transcripts'",
                type: "GET",

            })
            if (transcripts && transcripts.value.length > 0) {
                const transcriptId = transcripts.value[0].id;
                const transcriptContentUrl = transcripts.value[0].transcriptContentUrl;
                console.log(transcriptContentUrl);
                // 触发父组件
                onEventReceived(apiCon);
                //get Summary
                const axios = require('axios');
                const getTranscriptContent = async () => {
                    try {
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
                        console.log(content);
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
                        console.log('Successfully to gettranscriptContent');
                    }
                    const context = {
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an AI assistant that helps people find information.'
                            },
                            {
                                role: 'user',
                                content: `Summarize what I've missed and list the action items in bullet points from this transcript ${transcriptContent}`
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
                        const response = await axios.post(
                            'https://atc-openaippe.openai.azure.com/openai/deployments/Tarun-Bot-Test/chat/completions?api-version=2023-03-15-preview',
                            context,
                            { 
                                headers: {
                                    'Content-Type': 'application/json',
                                    'api-key': '5402ecbeeab345b2ae7f52cd1bbe8b46'
                                }
                            }
                        );
                        const generatedAnswer = response.data.choices[0].message.content;
                        console.log(generatedAnswer);
                        alert(generatedAnswer);
                    } catch (error) {
                        console.error(error);
                    }
                };
                generateSummary();
            } else {
                console.log('No transcripts found');
                return null;
            }
        } else {
            console.log('No online meetings found');
            alert('No online meetings found');
            return null;
        }
    };

    return (
        <div style={{ position: "absolute", right: "300px" }} className="clickButton" >
            {showClickMe && data.valueOf() && <button style={{ width: "70px", height: "30px", border: "none", textAlign: "right", backgroundColor: "#6c9ec5", borderRadius: "24px", color: "white" }}
                type="submit" onClick={buttonHandler}>Click Me</button>}
        </div>
    );
};
