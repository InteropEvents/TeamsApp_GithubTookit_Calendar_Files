import { Providers, ProviderState } from '@microsoft/mgt';
import {Presence} from '@microsoft/microsoft-graph-types';

//
// Available:
// activity: Available

// Busy:
// activity: Busy
// activity: InACall
// activity: InAMeeting

// DoNotDisturb:
// activity: DoNotDisturb
// activity: DoNotDisturb

// BeRightBack:
// activity: BeRightBack
// activity: BeRightBack

// Away:
// activity: Away
// activity: BeRightBack

// Offline:
// activity: OffWork

export enum Availability {
    Available = 'Available',
    Busy = 'Busy',
    DoNotDisturb = 'DoNotDisturb',
    BeRightBack = 'BeRightBack',
    Away = 'Away',
    Offline = 'Offline'
  }

export enum Activity {
    Available = 'Available',
    Busy= 'Busy',
    DoNotDisturb = 'DoNotDisturb',
    InACall = 'InACall',
    InAMeeting = 'InAConferenceCall',
    Presenting = 'Presenting',
    Focusing = 'Focusing',
    Away = 'Away',
    BeRightBack = 'BeRightBack',
    OffWork = 'OffWork'
  }
  export const updatePresence = async (availability: Availability, activity: Activity) => {
    const provider = Providers.globalProvider;
    if (provider && provider.state === ProviderState.SignedIn) {
      try {
        console.log('Udpate presence to: ', availability, activity);
        const graphClient = provider.graph.client;
        var response = await graphClient
          .api('/me/presence/setPresence')
          .version('beta') 
                   
          .post({
            sessionId: process.env.REACT_APP_CLIENT_ID!,
            availability: availability,
            activity: activity,
            expirationDuration :"PT1H"
            
          });
      } catch (error) {
        const err = error as any; // Type assertion
        console.error('Error setting presence:', err+" availability:"+availability+" activity:"+activity);
      }
    } else {
      console.error('User is not signed in');
    }
  };
export const updatePreferredPresence = async (availability: Availability, activity: Activity) => {
    const provider = Providers.globalProvider;
    if (provider && provider.state === ProviderState.SignedIn) {
      try {
        console.log('updatePreferredPresence to ', availability, activity);
        const graphClient = provider.graph.client;
        await graphClient
          .api('/me/presence/setUserPreferredPresence')
          .version('beta') 
                   
          .post({
            sessionId: process.env.REACT_APP_CLIENT_ID!,
            availability: availability,
            activity: activity,
            expirationDuration :"PT8H"
            
          });
      } catch (error) {
        const err = error as any; // Type assertion
        console.error('Error setting presence:', err+" availability:"+availability+" activity:"+activity);
      }
    } else {
      console.error('User is not signed in');
    }
  };

  export const subscribePresence = async (userId: string) => {
    const provider = Providers.globalProvider;
    if (provider && provider.state === ProviderState.SignedIn) {
      try {
        const graphClient = provider.graph.client;
        const notificationUrl =`https://${process.env.REACT_APP_DOMAIN}/resourceNotifications`;
        
        // Check if the subscription already exists
        const existingSubscriptions = await graphClient
        .api('/subscriptions')
        .version('beta')
        .get();
        const existingSubscription = existingSubscriptions.value.find(
          (sub: any) => sub.resource === `/communications/presences/${userId}`
        );

        if (existingSubscription) {
          console.log('Subscription already exists:', existingSubscription);
          // await graphClient
          //           .api(`/subscriptions/${existingSubscription.id}`)
          //           .version('beta')
          //           .delete();
          return;
        } 
        // Create a new subscription
        const subscription = {
          changeType: "updated",
          notificationUrl: notificationUrl,
          resource: `/communications/presences/${userId}`,
          expirationDateTime: new Date(Date.now() + 3600 * 1000).toISOString(),
          clientState: "secretClientState"
        };

        console.log('Subscription payload:', subscription);

        await graphClient
          .api('/subscriptions')
          .version('beta')         
          .post(subscription);
      } catch (error) {
        const err = error as any; // Type assertion
        console.error('Error clearclear presence:', err);
      }
    } else {
      console.error('User is not signed in');
    }
  }

  export const clearPreferredPresence = async () => {
    const provider = Providers.globalProvider;
    if (provider && provider.state === ProviderState.SignedIn) {
      try {
        const graphClient = provider.graph.client;
        await graphClient
          .api('/me/presence/clearUserPreferredPresence')
          .version('beta')         
          .post({});
      } catch (error) {
        const err = error as any; // Type assertion
        console.error('Error clearclear presence:', err);
      }
    } else {
      console.error('User is not signed in');
    }
  }

  export const getPresence = async () => {
    const provider = Providers.globalProvider;
    if (provider && provider.state === ProviderState.SignedIn) {
      try {
        const graphClient = provider.graph.client;
        const presence = await graphClient
          .api('/me/presence')
          .version('beta')
          .get();
        return presence;
      } catch (error) {
        const err = error as any; // Type assertion
        console.error('Error getting presence:', err);
      }
    } else {
      console.error('User is not signed in');
    }
  }
