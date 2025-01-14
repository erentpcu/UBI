import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

export function ProtectedRoute({ children }) {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);

  React.useEffect(() => {
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'login/login' }],
      });
    }
  }, [user, navigation]);

  if (!user) {
    return null;
  }

  return children;
}
