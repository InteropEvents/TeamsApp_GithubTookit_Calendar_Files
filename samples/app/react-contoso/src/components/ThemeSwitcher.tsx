import * as React from 'react';
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    webDarkTheme,
    webLightTheme,
    teamsLightTheme,
    teamsDarkTheme
} from '@fluentui/react-components';
import { BrightnessHighRegular, WeatherMoonFilled, PeopleTeamRegular, PeopleTeamFilled } from '@fluentui/react-icons';
import { useAppContext } from '../AppContext';
import { IconButton } from '@fluentui/react';
import { useState, useEffect } from 'react';
import { write } from 'fs';
import PubSub from 'pubsub-js';
import { Providers, ProviderState } from '@microsoft/mgt';



const availableThemes = [
    {
        key: 'light',
        displayName: 'Web Light',
        icon: <BrightnessHighRegular />
    },
    {
        key: 'dark',
        displayName: 'Web Dark',
        icon: <WeatherMoonFilled />
    },
    {
        key: 'teamsLight',
        displayName: 'Teams Light',
        icon: <PeopleTeamRegular />
    },
    {
        key: 'teamsDark',
        displayName: 'Teams Dark',
        icon: <PeopleTeamFilled />
    }
];

export const ThemeSwitcher = () => {
    const [selectedTheme, setSelectedTheme] = React.useState<any>(availableThemes[0]);
    const appContext = useAppContext();
    const [getAPIcontent, setAPIcontent] = useState(Array<{ api: string; type: string; }>);
    const [getHandleRemoveAPI, setHandleRemoveAPI] = useState(false);
    const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
    const nextDateItme = new Date();
    const MondayGet = nextDateItme.setDate(nextDateItme.getDate() - nextDateItme.getDay() + 1)
    let startdatetimeData = new Date(MondayGet).toISOString().substr(0, 10);
    let enddatetimeData = new Date(new Date(MondayGet).setDate(new Date(MondayGet).getDate() + 6)).toISOString().substr(0, 10);
    const [getEnd, setEnddatetimeData] = useState(enddatetimeData);
    const [getStart, setStartdatetimeData] = useState(startdatetimeData);
    const [butNex, buttonTime] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    /*    const [width, setWidth] = useState("100%");*/
    // 子组件触发父组件
    //const APIcontent = (message) => {
    //    setAPIcontent(getAPIcontent => getAPIcontent.concat(message));
    //};


    //token: string | PubSubJS.SubscriptionListener<any> = '';
    const [token, setToken] = React.useState<string | PubSubJS.SubscriptionListener<any>>('');

    React.useEffect(() => {

        const subscriptionToken = PubSub.subscribe('updateToastProps', async (topic, data) => {
            setAPIcontent(data);

        });

        return () => {
            PubSub.unsubscribe(subscriptionToken);
        };
    }, []);
    //Close And Clear APIContent
    const handleRemoveAPI = () => {
        setAPIcontent([]);
        setHandleRemoveAPI(false);
       
    }
    //const handleButtonClick = () => {
    //    setHandleRemoveAPI(true);
    //    setWidth("55%");
    //};
    const onThemeChanged = (theme: any) => {
        setSelectedTheme(theme);
        // Applies the theme to the Fluent UI components
        switch (theme.key) {
            case 'teamsLight':
                appContext.setState({
                    ...appContext.state,
                    theme: { key: 'light', fluentTheme: teamsLightTheme }
                });
                break;
            case 'teamsDark':
                appContext.setState({
                    ...appContext.state,
                    theme: { key: 'dark', fluentTheme: teamsDarkTheme }
                });
                break;
            case 'light':
                appContext.setState({
                    ...appContext.state,
                    theme: { key: theme.key, fluentTheme: webLightTheme }
                });
                break;
            case 'dark':
                appContext.setState({
                    ...appContext.state,
                    theme: { key: theme.key, fluentTheme: webDarkTheme }
                });
                break;
        }
    };

    return (
   
        <div>
            
            <Menu>
                <MenuTrigger>
                    <MenuButton icon={selectedTheme.icon}>{selectedTheme.displayName}</MenuButton>
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        {availableThemes.map(theme => (
                            <MenuItem icon={theme.icon} key={theme.key} onClick={() => onThemeChanged(theme)}>
                                {theme.displayName}
                            </MenuItem>
                        ))}
                    </MenuList>
                </MenuPopover>
            </Menu>
            {getHandleRemoveAPI && <div style={{ position: 'absolute', backgroundColor: '#dadada', right: '5px', width: "500px", lineHeight: "30px", height: "100%", border: "1px solid #000", padding: "5px" }}>
                <IconButton onClick={() => handleRemoveAPI()} iconProps={{ iconName: 'Cancel' }} style={{ fontSize: '20px', color: 'black', float: 'right' }} />
                <button onClick={() => setAPIcontent([])} style={{ fontSize: '15px', color: 'black', width: "80px", height: "20px", border: "none", textAlign: "center", backgroundColor: "rgb(195 189 189)", borderRadius: "24px" }} >Clear</button>
                <p></p>
                {getAPIcontent.map((tag, index) => (
                    <div key={index} >
                        {tag.type === 'GET' || tag.type === 'POST' ? <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px" }}>
                            <span><b>{tag.type}</b></span>
                            <p style={{ margin: "0px", wordBreak: "break-all" }}><b>api:</b>{tag.api}</p>
                        </div> : ""
                        }
                    </div>
                ))}
            </div>}
            );
            </div>
       
    );
};
