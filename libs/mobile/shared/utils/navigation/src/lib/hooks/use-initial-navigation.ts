import { useNavigationContainerRef } from 'expo-router';
import { navigationConfig } from '../config';

export const useInitialNavigation = (): { resetToCreateChatScreen: () => void; resetToChatsListScreen: () => void } => {
  const rootNavigation = useNavigationContainerRef();

  const resetToCreateChatScreen = (): void => {
    rootNavigation.reset({
      index: 0,
      routes: [
        {
          name: navigationConfig.main.root,
          state: {
            routes: [
              {
                name: navigationConfig.main.chat.index,
                state: {
                  routes: [
                    {
                      name: navigationConfig.main.chat.list,
                    },
                    {
                      name: navigationConfig.main.chat.create,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  };

  const resetToChatsListScreen = (): void => {
    rootNavigation.reset({
      index: 0,
      routes: [
        {
          name: navigationConfig.main.root,
          state: {
            routes: [
              {
                name: navigationConfig.main.chat.index,
                state: {
                  routes: [
                    {
                      name: navigationConfig.main.chat.list,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  };

  return {
    resetToCreateChatScreen,
    resetToChatsListScreen,
  };
};
