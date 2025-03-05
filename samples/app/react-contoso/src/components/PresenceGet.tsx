import * as React from 'react';
import { Person} from '@microsoft/mgt-react';
import {Presence} from '@microsoft/microsoft-graph-types';
import { PresenceAvailable16Filled, PresenceDnd16Filled,PresenceBusy16Filled, PresenceAway16Filled, PresenceOffline16Regular ,ChevronRight16Filled} from '@fluentui/react-icons';
import { makeStyles,Menu,MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { updatePreferredPresence,getPresence,Availability, Activity } from '../services/graphPresenceService';

const useStyles = makeStyles({
    simpleLogin: {
    '--person-avatar-size': '32px'
    },
    available: {
    marginRight: '5px',
    color: 'green',
    },
    busy: {
    marginRight: '5px',
    color: 'red',
    },
    away: {
    marginRight: '5px',
    color: '#FFA500',
    },
    offline: {
    marginRight: '5px',
    color: 'gray',
    },
    presenceContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '15px',
        fontSize: '13px',
        marginLeft: '58px',
        width: '100%',
        justifyContent: "space-between",
    },
    presenceInfo:{
        display: 'flex',
        alignItems: 'center',
    }, 
    popupContent: {
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white', 
        position: 'fixed',
        border: '1px solid #ccc',
        boxShadow: '0 4px 8px rgba(15, 8, 8, 0.1)', 
        borderRadius: '8px', 
        width: '150px',
    },
    menuList: {
        fontSize: '14px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
    },
    menuButton: {
        background: "none",
        border: "none",
        padding: "0",
        margin: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      },
});
export const PresenceGet: React.FunctionComponent<{ container: string,userId:string }> = ({ container, userId}) => {
    const styles = useStyles();
    const [presence, setPresence] = React.useState<Presence | undefined>(undefined);


  React.useEffect(() => {
    const fetchPresence = async () => {
        let pre = await getPresence();
        setPresence(pre);

    };
    fetchPresence(); 
    
    const websocketUrl = `wss://${process.env.REACT_APP_DOMAIN || 'localhost:5000'}`;
    const socket = new WebSocket(websocketUrl);
  
    socket.onmessage = async(event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);
      if (data.value && data.value.length > 0) {
        const notification = data.value[0];
        const { resource, changeType } = notification;
        const currentResource   = `communications/presences('${userId}')`;
        if (resource === currentResource && changeType === 'updated') {
            await getPresence().then((presence) => {
              setPresence(presence);
            });
        }
      }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
        socket.close();
    };
  
  }, []);

    const getPresenceIcon = (presence: Presence | undefined) => {
        switch (presence?.availability) {
        case Availability.Available: 
        case 'AvailableIdle':
            return <PresenceAvailable16Filled className={`${styles.available}`} />;
        case Availability.Busy:
        case 'BusyIdle':
            return <PresenceBusy16Filled className={`${styles.busy}`} />;
        case Availability.DoNotDisturb:
            return <PresenceDnd16Filled className={`${styles.busy}`} />;
        case Availability.BeRightBack:
            return <PresenceAway16Filled className={`${styles.away}`} />;
        case Availability.Away:
            return <PresenceAway16Filled className={`${styles.away}`} />;
        case Availability.Offline:
            return <PresenceOffline16Regular className={`${styles.offline}`} />;
        default:
            return null;
        }
        
    };
    const handlePresenceClick = async (newPresence: string) => {
        try {
            // switch case to set presence
            switch (newPresence) {
                case Availability.Available:
                    await updatePreferredPresence(Availability.Available, Activity.Available);
                    break;
                case Availability.Busy:
                    await updatePreferredPresence(Availability.Busy, Activity.Busy);
                    break;
                case Availability.DoNotDisturb:
                    await updatePreferredPresence(Availability.DoNotDisturb, Activity.DoNotDisturb);
                    break;
                case Availability.BeRightBack:
                    await updatePreferredPresence(Availability.BeRightBack, Activity.BeRightBack);
                    break;
                case Availability.Away:
                    await updatePreferredPresence(Availability.Away, Activity.Away);
                    break;
                case Availability.Offline:
                    await updatePreferredPresence(Availability.Offline, Activity.OffWork);
                    break;
                default:
                    break;
            }
        } catch (error) {
        console.error('Error updating presence:', error);
        }
    };

    switch (container) {
        case "simpleLogin":
            return (
                <Person
                personQuery='me'
                showPresence={true}
                className={styles.simpleLogin}
                personPresence={presence}
                />
            );
        case "flyoutLogin":
        return (
            <div className={styles.presenceContainer}>
                <div className={styles.presenceInfo}>
                {getPresenceIcon(presence)}
                <span>{presence?.availability}</span>
                </div>
                <Menu>
                    <MenuTrigger>
                    <button className={styles.menuButton}>
                        <ChevronRight16Filled/>
                    </button>
                    </MenuTrigger>
                    <MenuPopover className={styles.popupContent}>
                        <MenuList className={styles.menuList}>
                        <MenuItem onClick={() => handlePresenceClick(Availability.Available)}>
                            <PresenceAvailable16Filled  className={styles.available}/> Available
                        </MenuItem>
                        <MenuItem onClick={() => handlePresenceClick(Availability.Busy)}>
                            <PresenceBusy16Filled className={styles.busy} /> Busy
                        </MenuItem>
                        <MenuItem onClick={() => handlePresenceClick(Availability.DoNotDisturb)}>
                            <PresenceDnd16Filled className={styles.busy}/> Do not Disturb
                        </MenuItem>
                        <MenuItem onClick={() => handlePresenceClick(Availability.BeRightBack)}>
                            <PresenceAway16Filled className={styles.away}/> Be right back
                        </MenuItem>
                        <MenuItem onClick={() => handlePresenceClick(Availability.Away)}>
                            <PresenceAway16Filled className={styles.away}/> Appear away
                        </MenuItem>
                        <MenuItem onClick={() => handlePresenceClick(Availability.Offline)}>
                            <PresenceOffline16Regular className={styles.offline}/> Appear Offline
                        </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
        );
        default:
        return <div></div>
    }

    
}