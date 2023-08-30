import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { SideNavigation } from './components/SideNavigation';
import { HomePage } from './pages/HomePage';
import { useIsSignedIn } from './hooks/useIsSignedIn';
import { NavigationItem } from './models/NavigationItem';
import { getNavigation } from './services/Navigation';
import { FluentProvider, makeStyles, mergeClasses, shorthands } from '@fluentui/react-components';
import { tokens } from '@fluentui/react-theme';
import { applyTheme } from '@microsoft/mgt-react';
import { useAppContext } from './AppContext';
import { IconButton } from '@fluentui/react';
import { useState, useEffect } from 'react';
import {
    MenuButton,
} from '@fluentui/react-components';
const useStyles = makeStyles({
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    height: '100%',
    minWidth: '295px',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground6
  },
  main: {
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'row',
    width: 'auto',
    height: 'calc(100vh - 50px)',
    boxSizing: 'border-box'
  },
  minimized: {
    minWidth: 'auto'
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: '100%',
    height: 'auto',
    boxSizing: 'border-box',
    ...shorthands.margin('10px'),
    ...shorthands.overflow('auto')
  }
});

export const Layout: React.FunctionComponent = theme => {
    const styles = useStyles();

    const [navigationItems, setNavigationItems] = React.useState<NavigationItem[]>([]);
    const [isSignedIn] = useIsSignedIn();
    const appContext = useAppContext();
    const [getHandleRemoveAPI, setHandleRemoveAPI] = useState(false);
     const [getAPIcontent, setAPIcontent] = useState<any[]>([]);
    //const [getAPIcontent, setAPIcontent] = useState<any[]>([]);
    
    const handleRemoveAPI = () => {
        if (getAPIcontent.length >= 0) {
            setHandleRemoveAPI(false); //Success Close，When Content is null
            setAPIcontent([]);
        }
    };

    const handleClearAPI = () => { 
        setAPIcontent([]);
        PubSub.publish("ClearAPIdata", []);
    };

    React.useEffect(() => {
        setNavigationItems(getNavigation(isSignedIn));
       
    }, [isSignedIn]);

    React.useEffect(() => {
        const subscriptionToken = PubSub.subscribe('updateToastProps', async (topic, data) => {
            console.log("data", data, "getAPIcontent", getAPIcontent);
            setAPIcontent([...data, ...getAPIcontent]);
           /* setAPIcontent(data);*/
        });
        return () => {
            PubSub.unsubscribe(subscriptionToken);
        };
    });

    React.useEffect(() => {
        // Applies the theme to the MGT components
        applyTheme(appContext.state.theme.key as any);
    }, [appContext]);
    return (
        <FluentProvider theme={appContext.state.theme.fluentTheme}  >
            <div className={styles.page} >

                <HashRouter >

                    <div style={{ position: 'relative' }}>
                        <p></p>
                        <MenuButton
                            appearance='transparent'
                            style={{
                                position: 'absolute',
                                top: '23px',
                                right: '190px',
                                fontSize: '13px',
                                backgroundColor: '#ffffff',
                                color: 'black'
                            }}
                            onClick={() => { setHandleRemoveAPI(true); }}
                        >
                            Show API
                        </MenuButton>
                        <Header></Header>
                    </div>

                    <div className={styles.main}  >
                        <div
                            className={mergeClasses(
                                styles.sidebar,
                                `${appContext.state.sidebar.isMinimized ? styles.minimized : ''}`

                            )
                            }
                        >
                            <SideNavigation items={navigationItems}></SideNavigation>
                        </div>
                        <div className={styles.content} >
                            <Switch >
                                {navigationItems.map(
                                    item =>
                                        ((item.requiresLogin && isSignedIn) || !item.requiresLogin) && (

                                            <Route exact={item.exact} path={item.url} children={item.component} key={item.key}

                                            />
                                        )
                                )}
                                <Route path="*" component={HomePage} />
                            </Switch>
                        </div>
                        {getHandleRemoveAPI && (
                            <div style={{ width: "800px", lineHeight: "30px", height: "100%", border: "1px solid  #ccc", padding: "5px", overflow: "auto" }}>
                                <IconButton onClick={() => handleRemoveAPI()} iconProps={{ iconName: 'Cancel' }} style={{ fontSize: '20px', color: 'black', float: 'right' }} />
                                <button onClick={() => { handleClearAPI() }} style={{ fontSize: '15px', color: 'black', width: "80px", height: "20px", border: "none", textAlign: "center", backgroundColor: "#dadada", borderRadius: "24px" }} >Clear</button>
                                <p></p>
                                {getAPIcontent.map((tag, index) => (
                                    <div key={index}>
                                        {tag.type === 'GET' || tag.type === 'POST' ? (
                                            <div style={{ borderBottom: "2px solid  #ccc", paddingBottom: "20px" }}>
                                                <span><b>{tag.type}</b></span>
                                                <p style={{ margin: "0px", wordBreak: "break-all" }}><b>api:</b>{tag.api}</p>
                                            </div>
                                        ) : ""}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                </HashRouter>
            </div>
        </FluentProvider>
    );
};