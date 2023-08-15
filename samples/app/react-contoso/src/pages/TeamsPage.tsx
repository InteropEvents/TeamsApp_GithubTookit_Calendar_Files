import * as React from 'react';
import { PageHeader } from '../components/PageHeader';
import {
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  TabValue,
  shorthands,
  makeStyles
} from '@fluentui/react-components';
import { ChannelFiles } from './Files/ChannelFiles';

const useStyles = makeStyles({
  panels: {
    ...shorthands.padding('10px')
  }
});

export const TeamsPage: React.FunctionComponent = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<TabValue>('channel');

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  return (
    <>
      <PageHeader
        title={'Teams'}
        description={
          'View your files from accross your channels you are a member of'
        }
      ></PageHeader>

      <div>
        <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
          <Tab value="channel">Channel Files</Tab>
        </TabList>
        <div className={styles.panels}>
          {selectedTab === 'channel' && <ChannelFiles />}
        </div>
      </div>
    </>
  );
};
