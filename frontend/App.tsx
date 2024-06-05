import { Stack } from 'expo-router';

export default function App() {
  return (
    <Stack>
      <Stack.Screen name="index" component={Home} />
      <Stack.Screen name="room" component={RoomPage} />
    </Stack>
  );
}
