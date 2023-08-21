import * as React from 'react';
import { 
  FileList,
  Get
} from '@microsoft/mgt-react';
import { makeStyles, Spinner } from '@fluentui/react-components';
import { Tree, TreeItem, TreeItemLayout } from '@fluentui/react-tree';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';


const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },

  teamChannel: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: '30%'
  },

  channelFiles: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: '70%',
    '--file-list-box-shadow': 'none'
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

const MyTeams = (props) => {
  const teams = props.dataContext.value;
  const { getSelectedTeamId } = props;
  console.log(props);

  const onTeamClick = (id) => {
    getSelectedTeamId(id);
  }

  return(
    <Tree>
      {teams && (
        teams.map((team) => (
          <TreeItem itemType='branch' onClick={() => onTeamClick(team.id)}>
            <TreeItemLayout>{team.displayName}</TreeItemLayout>
            <Tree>
              <Get
                resource={`teams/${team.id}/channels`}
              >
                <MyChannels template='value'
                  getSelectedChannelName={props.getSelectedChannelName}
                ></MyChannels>
                <ChannelsLoading template='loading'></ChannelsLoading>
              </Get>
            </Tree>
          </TreeItem>
        ))
      )}
    </Tree>
  );
}

const ChannelsLoading = (props) => {
  const styles = useStyles();

  return(
    <div className={styles.loading}>
      <Spinner size='tiny'/>
      <div className={styles.loadingMessage}>
        <span>{props.message || 'Loading...'}</span>
      </div>
    </div>
  );
}

const MyChannels = (props) => {
  const { getSelectedChannelName } = props;
  const { displayName } = props.dataContext;

  const onChannelClick = () => {
    getSelectedChannelName(displayName);
  }

  return(
    <TreeItem itemType='leaf' onClick={onChannelClick}>
      <TreeItemLayout style={{ marginLeft:'3vh' }}>{displayName}</TreeItemLayout>
    </TreeItem>
  );
}

export const ChannelFilesPage: React.FunctionComponent = () => {
  const styles = useStyles();
  const [selectedTeamId, setSelectedTeamId] = React.useState('');
  const [selectedChannelName, setSelectedChannelName] = React.useState('');

  const getSelectedTeamId = (teamId) => {
    setSelectedTeamId(teamId);
  }
  const getSelectedChannelName = (channelName) => {
    setSelectedChannelName(channelName);
  }

  return (
    <>
      <PageHeader
        title='Group Channel Files'
        description='View files from access channels you are a member of'
      ></PageHeader>
      <div className={styles.container}>
        <Get
          resource='/me/joinedTeams'
          className={styles.teamChannel}
        >
          <MyTeams template='default'
            getSelectedTeamId={getSelectedTeamId}
            getSelectedChannelName={getSelectedChannelName}
          ></MyTeams>
          <Loading template='loading'></Loading>
        </Get>

        { selectedChannelName !== '' ? (
          <FileList
            groupId={selectedTeamId}
            itemPath={selectedChannelName}
            pageSize={100}
            className={styles.channelFiles}
          >
            <Loading template='loading'></Loading>
          </FileList>
        ) : null}
      </div>
    </>
  );
};
