import { NavigationItem } from '../models/NavigationItem';
import {
  HomeRegular,
  CalendarMailRegular,
  DocumentRegular,
  DocumentBulletListMultiple24Regular
} from '@fluentui/react-icons';
import { CalendarPage } from '../pages/CalendarPage';
import { HomePage } from '../pages/HomePage';
import { ChannelFilesPage } from '../pages/TeamsPage';

export const getNavigation = (isSignedIn: boolean) => {
  let navItems: NavigationItem[] = [];

  navItems.push({
    name: 'Home',
    url: '/',
    icon: <HomeRegular />,
    key: 'home',
    requiresLogin: false,
    component: <HomePage />,
    exact: true
  });

  if (isSignedIn) {
    navItems.push({
      name: 'Calendar',
      url: '/Calendar',
      icon: <CalendarMailRegular />,
      key: 'outlook',
      requiresLogin: true,
      component: <CalendarPage />,
      exact: true
    });

    navItems.push({
      name: 'Teams',
      url: '/teams',
      icon: <DocumentBulletListMultiple24Regular />,
      key: 'team',
      requiresLogin: true,
      component: <ChannelFilesPage />,
      exact: true
    });

  }
  return navItems;
};
