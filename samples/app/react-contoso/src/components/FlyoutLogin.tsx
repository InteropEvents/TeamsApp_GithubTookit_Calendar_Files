import * as React from 'react';
import { Person, MgtTemplateProps} from '@microsoft/mgt-react';
import { makeStyles} from '@fluentui/react-components';
import { PresenceGet } from './PresenceGet';


const useStyles = makeStyles({
  personAvatar: {
    '--person-avatar-size': '48px'
  },
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection : 'column',
  },
  statusContainer:{
    display: 'flex',
    width: '100%',
    marginTop: '10px'
  }
});

export const LoginFlyout: React.FunctionComponent<MgtTemplateProps> = (props) => {
  const styles = useStyles();
  const { personDetails } = props.dataContext;

  return (
    <div className={styles.container}>
    <Person 
    userId={personDetails.id} 
    className={styles.personAvatar}
    view={'fourlines'}
    />
    <div className={styles.statusContainer}>
      <PresenceGet container={"flyoutLogin"} userId={personDetails.id}></PresenceGet>
    </div>

  </div>
  
  );
};
