import * as React from 'react';
import { ResponseType } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { MgtTeamsChannelPicker, FileList, File, MgtTemplateProps } from '@microsoft/mgt-react';
import { makeStyles, Button } from '@fluentui/react-components';
import { Tree, TreeItem, TreeItemLayout } from '@fluentui/react-tree';
import { ChevronRightRegular } from '@fluentui/react-icons';
import { Team, Channel } from '@microsoft/microsoft-graph-types';
import { IGraph, prepScopes, Providers, TemplateContext } from '@microsoft/mgt-element';
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

let getAPIcontent: Array<{ api: string; type: string; }> = [];
const ChannelsTree = (props) => {
    const [channels, setChannels] = React.useState<Channel[]>([]);
    const [loading, setLoading] = React.useState(false);
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
        } catch (error) {
            console.error(error);
            getChannels();
        } finally {
            setLoading(false);
        }
    }

    const getSelectedTeamChannel = (channelName, channelId) => {
        setSelectedTeamId(teamId);
        setSelectedChannelName(channelName);
        setSelectedChannelId(channelId);

        let apiCon = [{
            api: `https://graph.microsoft.com/v1.0/groups/${teamId}/drive/root:/${channelName}:/children`,
            type: "GET"
        }];
        PubSub.publish("Calendar", apiCon);
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
                        <div style={{ marginLeft: '1.2vh' }}>
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
            style={{ width: '25px', borderRadius: '4px', marginRight: '1vh' }}
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


    const [isViewerVisible, setIsViewerVisible] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handleCloseViewer = () => {
        setIsViewerVisible(false);
        setPreviewUrl(null);
    };

    const handlePreviewButtonClick = async (fileItem: MicrosoftGraph.DriveItem) => {
        if (!fileItem.file) {
            return;
        }
        const parentReference = fileItem.parentReference;
        if (!parentReference) {
            return;
        }
        const driveId = parentReference.driveId;
        const itemId = fileItem.id;
        const previewEndpoint = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/preview`;

        try {
            const response = await graph.api(previewEndpoint).post({});
            const previewUrl = response.getUrl;
            setPreviewUrl(previewUrl);
            setIsViewerVisible(true);
        } catch (error) {
            console.error('Error fetching preview URL:', error);
        }
    };

    const FileTemplate = (props: MgtTemplateProps) => {
        const file = props.dataContext.file as MicrosoftGraph.DriveItem;
        return <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '8px',
            }}>
                <div
                    onClick={() => {
                        if (file.webUrl) {
                            window.open(file.webUrl, '_blank', 'noopener,noreferrer');
                        }
                    }}
                >
                    <File fileDetails={file}></File>
                </div>
                {file.file && (
                    <Button
                        onClick={() => handlePreviewButtonClick(file)}
                    >
                        Preview
                    </Button>
                )}
            </div>
        </>
    };

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

                {selectedChannelName !== '' ? (
                    <FileList
                        key={`${selectedTeamId}-${selectedChannelName}`}
                        groupId={selectedTeamId}
                        itemPath={selectedChannelName}
                        pageSize={100}
                        className={styles.channelFiles}
                        disableOpenOnClick={true}
                    >
                        <Loading template='loading'></Loading>
                        <FileTemplate template='file'></FileTemplate>
                    </FileList>
                ) : null}
            </div>
            {isViewerVisible && (
                <div id="embeddedFileViewer" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                }}>
                    <Button
                        appearance="primary"
                        onClick={handleCloseViewer}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 1001
                        }}
                    >
                        Close
                    </Button>
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        left: '50px',
                        right: '50px',
                        bottom: '50px',
                        backgroundColor: 'white',
                        padding: '20px',
                        overflow: 'auto'
                    }}>
                        {previewUrl ? (
                            <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
                        ) : (
                            <p>Loading preview...</p>
                        )}
                    </div>
                </div>
            )}
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

const APIcontent = (message) => {
    getAPIcontent.push(message);
};

const getAllMyTeams = async (graph: IGraph, scopes: string[]) => {
    const teams = await graph
        .api('/me/joinedTeams')
        .select(['displayName', 'id'])
        .middlewareOptions(prepScopes([...scopes]))
        .get();
    let apiCon = [{
        api: "https://graph.microsoft.com/beta//me/joinedTeams$select=displayName,id/",
        type: "GET"
    }];
    PubSub.publish("Calendar", apiCon);
    return teams?.value || [];
};

const getTeamPhoto = async (graph: IGraph, teamId: string, scopes: string[]) => {
    const response = (await graph
        .api(`/teams/${teamId}/photo/$value`)
        .responseType(ResponseType.RAW)
        .middlewareOptions(prepScopes([...scopes]))
        .get()
    ) as Response;
    let apiCon = [{
        api: "https://graph.microsoft.com/beta/teams/" + teamId + "/photo/$value/",
        type: "GET"
    }];
    PubSub.publish("Calendar", apiCon);
    const blob = await blobToBase64(await response.blob());
    return blob;
};

const getChannelsByTeam = async (graph: IGraph, teamId, scopes: string[]) => {
    const channels = await graph
        .api(`/teams/${teamId}/channels`)
        .middlewareOptions(prepScopes([...scopes]))
        .get();
    //Delete comments when display API
    let apiCon = [{
        api: "https://graph.microsoft.com/beta//teams/" + teamId + "/channels",
        type: "GET"
    }];
    PubSub.publish("Calendar", apiCon);
    return channels?.value || [];
}