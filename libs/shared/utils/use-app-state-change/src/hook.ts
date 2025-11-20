import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateChangeArgs {
  onChange: ((lastStatusChangeTimeStamp?: number | null) => void) | (() => void);
  status?: AppStateStatus;
}

export const useAppStateChange = ({ onChange, status = 'active' }: UseAppStateChangeArgs): void => {
  const lastStatusChangeTimeStamp = useRef<number | null>(null);

  const onAppStateChange = (st: AppStateStatus): void => {
    if (st === status) {
      onChange(lastStatusChangeTimeStamp.current);
    }
    lastStatusChangeTimeStamp.current = dayjs().valueOf();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => subscription.remove();
  }, [onAppStateChange]);
};
