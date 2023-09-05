import * as React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Agenda, Get } from '@microsoft/mgt-react';
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { MgtTemplateProps } from '@microsoft/mgt-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { ArrowCircleLeft48Regular, ArrowCircleRight48Regular, ChevronDown48Regular } from '@fluentui/react-icons';
import { initializeIcons } from '@fluentui/font-icons-mdl2';

import {
    SelectTabData,
    SelectTabEvent,
    Button,
    TabValue,
    shorthands,
    makeStyles,
    mergeClasses
} from '@fluentui/react-components';
import { IconButton, ProgressIndicator } from '@fluentui/react';
//import { apiKey } from '../Config';
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
    //let startdatetimeData = today.toISOString().substr(0, 10);
    let startdatetimeData = new Date(MondayGet).toISOString().substr(0, 10);
    let enddatetimeData = new Date(new Date(MondayGet).setDate(new Date(MondayGet).getDate() + 6)).toISOString().substr(0, 10);
    const [refreshKey, setRefreshKey] = useState(0);
    const [butNex, buttonTime] = useState(1);
    const [getEnd, setEnddatetimeData] = useState(enddatetimeData);
    const [getStart, setStartdatetimeData] = useState(startdatetimeData);
    const [showApiModal, setShowApiModal] = useState(true);
    /*   const [getAPIcontent, setAPIcontent] = useState(Array<{ api: string; type: string; }>);*/

    const [getHandleRemoveAPI, setHandleRemoveAPI] = useState(false);
    // 子组件触发父组件
    const APIcontent = (message) => {
        /* setAPIcontent((getAPIcontent) => [...getAPIcontent, ...message]);*/
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

    const handleNextCalendar = () => {
        const nextDate = new Date(getEnd);
        nextDate.setDate(nextDate.getDate() + 7); //NextWeek
        // setCurrentDate(nextDate);
        buttonTime(1);
        enddatetimeData = new Date(nextDate).toISOString();
        setEnddatetimeData(enddatetimeData);
        setStartdatetimeData(getEnd);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" + getEnd + "&enddatetime=" + enddatetimeData,
            type: "GET"
        }];
        //getAPIcontent.push(apiCo[0]);
        PubSub.publish("updateToastProps", apiCo);

    };

    const handlePreviousCalendar = () => {
        const previousDate = new Date(getStart);
        previousDate.setDate(previousDate.getDate() - 7); // PreWeek
        // setCurrentDate(previousDate);
        buttonTime(0);
        startdatetimeData = new Date(previousDate).toISOString();
        setEnddatetimeData(getStart);
        setStartdatetimeData(startdatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [
            {
                api:
                    "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" +
                    startdatetimeData +
                    "&enddatetime=" +
                    getStart,
                type: "GET",
            },
        ];
        PubSub.publish("updateToastProps", apiCo);
    };

    const handleToday = () => {
        const thisWeek = today.setDate(today.getDate() - today.getDay() + 1);
        let startdatetimeData = new Date(thisWeek).toISOString().substr(0, 10);
        setStartdatetimeData(startdatetimeData);
        let enddatetimeData = new Date(new Date(thisWeek).setDate(new Date(thisWeek).getDate() + 6)).toISOString().substr(0, 10);
        setEnddatetimeData(enddatetimeData);
        setRefreshKey(refreshKey + 1);
        let apiCo = [{
            api: "https://graph.microsoft.com/v1.0/me/calendarview?$orderby=start/dateTime&startdatetime=" + startdatetimeData + "&enddatetime=" + enddatetimeData,
            type: "GET"
        }]; 
        PubSub.publish("updateToastProps", apiCo);
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
        const subscriptionToken = PubSub.subscribe('ClearAPIdata', async (topic, data) => {

            getAPIcontent = [];

        });
        return () => {
            PubSub.unsubscribe(subscriptionToken);
        };
    })
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
        // 调用接口，模拟异步获取数据
        if (currentEvent.location.uniqueId === "Microsoft Teams Meeting") {
            let joinUrl = currentEvent.onlineMeeting.joinUrl;
            const onlineMeetings = client
                .api('me/onlineMeetings')
                .version('beta')
                .filter(`joinWebUrl eq '${joinUrl}'`)
                .get().then(response => {
                    const meeting = response.value[0];
                    const userId = meeting.participants.organizer.identity.user.id;
                    if (response && response.value.length > 0) {
                        const meeting = response.value[0];
                        const meetingId = meeting.id;
                        const transcripts = client.api(`me/onlineMeetings/${meetingId}/transcripts`).version('beta').get().then(responses => {
                            if (responses.value.length > 0) {
                                setData(true);
                            }
                        });
                    }
                })
        }
    }, []);


    const buttonHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);
        // 模拟异步请求
        setTimeout(() => {
            // 获取到数据后停止转圈效果
            setIsLoading(false);
            // 处理数据
            if (data) {
                setIsLoading(false);
            }
        }, 8888);
        //let apiCon: Array<{ api: string; type: string; }> = [];
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
            .version('beta')
            .filter(`joinWebUrl eq '${joinUrl}'`)
            .get();
        //apiCon.push({
        //    api: "https://graph.microsoft.com/beta/me/onlineMeetings?$filter=joinWebUrl eq '" + joinUrl + "'",
        //    type: "GET"
        //});
        //PubSub.publish("updateToastProps", apiCon);
        let apiCon = [{
            api: "https://graph.microsoft.com/beta/me/onlineMeetings?$filter=joinWebUrl eq '" + joinUrl + "'",
            type: "GET"
        }];
        PubSub.publish("updateToastProps", apiCon);
        const meeting = onlineMeetings.value[0];
        const userId = meeting.participants.organizer.identity.user.id;
        if (onlineMeetings && onlineMeetings.value.length > 0) {
            const meeting = onlineMeetings.value[0];
            const meetingId = meeting.id;
            const transcripts = await client.api(`me/onlineMeetings/${meetingId}/transcripts`).version('beta').get();
            let apiCon = [{
                api: "https://graph.microsoft.com/beta/me/onlineMeetings/" + meetingId + "/transcripts'",
                type: "GET"
            }];
      
            PubSub.publish("updateToastProps", apiCon);
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
                     
                        PubSub.publish("updateToastProps", apiCon);
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
                        let apiCon = [{
                            api: `https://atc-openaippe.openai.azure.com/openai/deployments/Tarun-Bot-Test/chat/completions?api-version=2023-03-15-preview`,
                            type: "POST"
                        }];
                        PubSub.publish("updateToastProps", apiCon);
                        onEventReceived(apiCon);
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

    return (
        <div style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)" }} className="clickButton" >
            {showClickMe && data.valueOf() && (
                <button style={{ fontSize: '20px', color: 'black', width: "200px", height: "30px", border: "none", textAlign: "center", backgroundColor: "#dadada", borderRadius: "24px" }}
                    type="submit" onClick={buttonHandler}>
                    {isLoading ? (
                        <ProgressIndicator label="Loading..." />
                    ) : (
                        "Meeting Summary"
                    )}
                </button>
            )}
        </div>
    );
};
