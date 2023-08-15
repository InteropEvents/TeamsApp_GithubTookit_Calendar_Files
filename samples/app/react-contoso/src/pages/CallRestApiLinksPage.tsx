import * as React from 'react';
import { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt';
import { Client } from '@microsoft/microsoft-graph-client';


export const CallRestApiLinksPage: React.FunctionComponent = () => {
    const [apiLinks, setApiLinks] = useState<string[]>([]);
    //const [textBoxVisible, setTextBoxVisible] = useState<boolean>(false);
    /*  const [textBoxContent, setTextBoxContent] = useState<string>('');*/

    useEffect(() => {
        getCallRestApiLinks();
    }, []);

    const getCallRestApiLinks = async () => {
        try {
            // Get token
            const token = await Providers.globalProvider.getAccessToken();
            console.log(1111111111111111111111);
            const options = {
                authProvider: done => {
                    done(null, token);
                }
            };
            /*const client = Client.init(options);*/
            //const response = await client.api('https://bot.contoso.com/api/calls').get();
            //const data = response.data;
            //const links = data.value.map((call) => call.apiLink);
            //setApiLinks(links);
        } catch (error) {
            console.error('Error fetching call rest API links:', error);
        }
    };
    const [textBoxContent] = useState([
        {
            value: '/me/calendarview?$orderby=start/dateTime&startdatetime=${eventQuery2}&enddatetime=${eventQuery}',
            description: 'Get calendardatetime view'
        },
        {
            value: 'Api:\nme/onlineMeetings/${meetingId}/transcripts\nDescription:\nClicking on the ClickME button in the Calendar will use this APi to retrieve the transcriptContentUrl from the Teams Meeting',

            description: 'Get online meeting transcripts'
        },
        {
            value: 'https://atc-openaippe.openai.azure.com/openai/deployments/Tarun-Bot-Test/chat/completions?api-version=2023-03-15-preview',
            description: 'OpenAI chat completions'
        },
        {
            value: 'https://graph.microsoft.com/beta/users/${userId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt',
            description: 'Get online meeting transcript content'
        }
    ]);

    const [selectedContent, setSelectedContent] = useState('');

    return (
        <div>
            <h1>CallRestApiLinks</h1>
            <h4> exhibit all call rest API links for calls</h4>
            {textBoxContent.map(item => (
                <button
                    key={item.description}
                    onClick={() => setSelectedContent(item.value)}
                >
                    {item.description}
                </button>
            ))}
            <textarea
                value={selectedContent}
                readOnly
                style={{
                    height: '2000px',
                    width: '1550px',
                    fontFamily: '微软雅黑',
                    lineHeight: '2.0'
                }}
            />
        </div>
    );
};