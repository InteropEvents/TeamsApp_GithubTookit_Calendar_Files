import * as React from 'react';
import { MgtTemplateProps} from '@microsoft/mgt-react';
import { PresenceGet} from './PresenceGet';
import { updatePresence,clearPreferredPresence,getPresence,Availability, Activity, subscribePresence } from '../services/graphPresenceService';


export const SimpleLogin: React.FunctionComponent<MgtTemplateProps> = (props) => {
  const { personDetails } = props.dataContext;
  React.useEffect(() => {
      subscribePresence(personDetails.id);
  
      const loginAndSetPresence = async () => {
        let pre = await getPresence();
          if (pre.availability === Availability.Offline || pre.availability === Availability.Away) {
            await clearPreferredPresence();
            await updatePresence(Availability.Available, Activity.Available);
          }
          else{
          }
      };
      loginAndSetPresence(); // refersh presence on first load

    }, []);

    return (
      <div>
      <PresenceGet container = {"simpleLogin"} userId={personDetails.id}></PresenceGet>
      </div>
    ); 
}
