import * as React from 'react';
import { ResponseType } from '@microsoft/microsoft-graph-client';
import { MgtTeamsChannelPicker, FileList } from '@microsoft/mgt-react';
import { makeStyles} from '@fluentui/react-components';
import { Tree, TreeItem, TreeItemLayout } from '@fluentui/react-tree';
import { ChevronRightRegular } from '@fluentui/react-icons';
import { Team, Channel } from '@microsoft/microsoft-graph-types';
import { IGraph, prepScopes, Providers } from '@microsoft/mgt-element';
import { PageHeader } from '../components/PageHeader';
import { Loading } from '../components/Loading';

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

  divider: {
    width: '1px',
    backgroundColor: '#D9D9D9'
  },

  channelFiles: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: '69%',
    '--file-list-box-shadow': 'none'
  }
});

const ChannelsTree = (props) => {
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [loading , setLoading] = React.useState(false);
  const [selectedChannelId, setSelectedChannelId] = React.useState('');
  const { 
    teamId, 
    graph, 
    selectedTeamId, 
    setSelectedTeamId, 
    setSelectedChannelName 
  } = props;
  const styles = useStyles();


  const getChannels = async () => {
    setLoading(true);

    try {
      const curChannels = await getChannelsByTeam(graph, teamId, MgtTeamsChannelPicker.requiredScopes)
      setChannels(curChannels);
    } catch(error) {
      console.error(error);
      getChannels();
    } finally {
      setLoading(false);
    }
  }

  const getSelectedTeamChannel = (channelName, channelId) => {
    setSelectedTeamId(teamId);
    setSelectedChannelName(channelName);
    setSelectedChannelId(channelId)
  }

  React.useEffect(() => {
    getChannels();
  }, []);

  return (
    <Tree aria-label='ChannelTree'>
      {channels.map((channel) => (
        <TreeItem 
          itemType='leaf' 
          key={channel.id}
          onClick={() => {
            getSelectedTeamChannel(channel.displayName, channel.id)
          }}
        >
          <TreeItemLayout 
            aside={(selectedChannelId === channel.id && selectedTeamId === teamId) ? 
              <ChevronRightRegular /> : null}
          >
            <div style={{marginLeft:'1.2vh'}}>
              {channel.displayName}
            </div>
          </TreeItemLayout>
        </TreeItem>
      ))}
    </Tree>
  );
}

const TeamImg = (props) => {
  const { graph, teamId } = props;
  const [teamPhoto, setTeamPhoto] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const getCurPhoto = async () => {
    setLoading(true);

    try {
      const photo = await getTeamPhoto(graph, teamId, MgtTeamsChannelPicker.requiredScopes) as string;
      setTeamPhoto(photo);
    } catch (error) {
      console.error(error);
      getCurPhoto();
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getCurPhoto();
  }, []);

  return (
    <img 
      src={teamPhoto} 
      alt='' 
      style={{ width: '25px', borderRadius: '4px', marginRight:'1vh' }}
    ></img>
  );
}

//main component
export const ChannelFilesPage: React.FunctionComponent = () => {
  const provider = Providers.globalProvider;
  const graph = provider.graph;
  const styles = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = React.useState('');
  const [selectedChannelName, setSelectedChannelName] = React.useState('');
  

  const getTeams = async () => {
    setLoading(true);

    try {
      const teams = await getAllMyTeams(graph, MgtTeamsChannelPicker.requiredScopes);
      setTeams(teams);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  }

  React.useEffect(() => {
    getTeams();
  }, []);
  
  return (
    <>
      <PageHeader
        title='Channel Files'
        description='View files from access channels you are a member of'
      ></PageHeader>
      <div className={styles.container}>
        <div className={styles.teamChannel}>
          {loading ? <Loading /> : 
            <Tree aria-label='TeamTree'>
              {teams.map((team) => (
                <TreeItem itemType='branch' key={team.id}>
                  <TreeItemLayout>
                    <div style={{ display: 'flex' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <TeamImg teamId={team.id} graph={graph} />
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {team.displayName}
                      </span>
                    </div>
                  </TreeItemLayout>
                  <ChannelsTree 
                    teamId={team.id} 
                    graph={graph} 
                    selectedTeamId={selectedTeamId}
                    setSelectedTeamId={setSelectedTeamId}
                    setSelectedChannelName={setSelectedChannelName}
                  />
                </TreeItem>
              ))}
            </Tree>
          }
        </div>

        <div className={styles.divider}></div>  
        
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
}

//utils

const blobToBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

const getAllMyTeams = async (graph: IGraph, scopes: string[]) => {
  const teams = await graph
    .api('/me/joinedTeams')
    .select(['displayName', 'id'])
    .middlewareOptions(prepScopes(...scopes))
    .get();

  return teams?.value || [];
};

const getTeamPhoto = async (graph: IGraph, teamId: string, scopes: string[]) => {
  const response = (await graph
    .api(`/teams/${teamId}/photo/$value`)
    .responseType(ResponseType.RAW)
    .middlewareOptions(prepScopes(...scopes))
    .get()
  ) as Response;

  const blob = await blobToBase64(await response.blob());
  return blob;
};

const getChannelsByTeam = async (graph: IGraph, teamId, scopes: string[]) => {
  const channels = await graph
    .api(`/teams/${teamId}/channels`)
    .middlewareOptions(prepScopes(...scopes))
    .get();

  return channels?.value || [];
}