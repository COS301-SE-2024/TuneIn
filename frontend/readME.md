# TuneIn with Expo Router

This README provides detailed instructions for setting up Expo Router in your React Native project. It includes examples of why these libraries are used, their advantages, common commands, and links to their respective resources.

## Table of Contents
- [Folder Structure](#folder-structure)
- [Installation](#installation)
  - [Expo Router](#expo-router)
- [Usage Examples](#usage-examples)
  - [Expo Router Usage](#expo-router-usage)
- [Advantages](#advantages)
- [Common Commands](#common-commands)
- [Editor Configuration](#editor-configuration)
- [Resources](#resources)

## Folder Structure

Here's an overview of how the project folders are structured:

```
my-app/
│
├── app/
│   ├── components/
│   │   ├── AppCarousel.tsx
│   │   ├── FriendsGrid.tsx
│   │   ├── NavBar.tsx
│   │   ├── RoomCardWidget.tsx
│   │   ├── TopNavBar.tsx
│   │   └── ... (other reusable components)
│   │
│   ├── models/
│   │   ├── friend.ts
│   │   ├── Room.ts
│   │   └── ... (other TypeScript class definitions)
│   │
│   ├── screens/
│   │   ├── rooms/
│   │   │   ├── RoomPage.tsx
│   │   │   ├── CreateRoom.tsx
│   │   │   └── ... (other room-related screens)
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ... (other auth-related screens)
│   │   │
│   │   └── ... (other pages/screens)
│   │
│   ├── hooks/
│   │   └── ... (reusable hooks)
│   │
│   └── index.tsx
│   
├── my-app.d.ts
├── babel.config.js
├── package.json
```

- **app/components/**: Contains all reusable components.
- **app/models/**: Contains TypeScript class definitions to streamline data handling.
- **app/screens/**: Contains all the screens (pages) of the app.
- **app/screens/rooms/**: Contains room-related screens.
- **app/screens/auth/**: Contains authentication-related screens.
- **app/hooks/**: Contains reusable hooks.
- **app/index.tsx**: The entry point for the app.

## Installation

### Expo Router

Expo Router provides a file-based routing solution for Expo projects.

1. **Install Expo Router:**

    ```bash
    npx expo install expo-router
    ```

2. **Set up routing configuration:**

    Create a folder structure under your project root with the following files:

    - app
      - _layout.tsx
      - index.tsx

    **_layout.tsx:**

    ```tsx
    import { Stack } from 'expo-router';

    const Layout = () => {
      return <Stack />;
    };

    export default Layout;
    ```

    **index.tsx:**

    ```tsx
    import React from 'react';
    import { View, Text } from 'react-native';

    const Home = () => {
      return (
        <View>
          <Text>Welcome to the Home Page</Text>
        </View>
      );
    };

    export default Home;
    ```

3. **Update app.json:**

    Make sure to include the expo-router plugin:

    ```json
    {
      "expo": {
        "plugins": [
          [
            "expo-router",
            {
              "origin": "router"
            }
          ]
        ]
      }
    }
    ```

## Usage Examples

### Expo Router Usage

#### Using Link Component

The Link component is a convenient way to navigate between screens declaratively.

1. **Create a new screen component:**

    ```tsx
    // screens/Profile.tsx
    import React from 'react';
    import { View, Text } from 'react-native';

    const Profile = () => {
      return (
        <View>
          <Text>This is the Profile Page</Text>
        </View>
      );
    };

    export default Profile;
    ```

2. **Link to the new screen using Link component:**

    ```tsx
    // screens/Home.tsx
    import React from 'react';
    import { View, Text } from 'react-native';
    import { Link } from 'expo-router';

    const Home = () => {
      return (
        <View>
          <Text>Welcome to the Home Page</Text>
          <Link href="/screens/Profile">
            <Text style={{ color: 'blue' }}>Go to Profile</Text>
          </Link>
        </View>
      );
    };

    export default Home;
    ```

#### Using router.navigate

For more programmatic navigation, use the router.navigate method.

1. **Create a new screen component:**

    ```tsx
    // screens/Settings.tsx
    import React from 'react';
    import { View, Text } from 'react-native';

    const Settings = () => {
      return (
        <View>
          <Text>This is the Settings Page</Text>
        </View>
      );
    };

    export default Settings;
    ```

2. **Navigate to the new screen using router.navigate:**

    ```tsx
    // screens/Home.tsx
    import React from 'react';
    import { View, Text, Button } from 'react-native';
    import { useRouter } from 'expo-router';

    const Home = () => {
      const router = useRouter();

      return (
        <View>
          <Text>Welcome to the Home Page</Text>
          <Button title="Go to Settings" onPress={() => router.navigate('/screens/Settings')} />
        </View>
      );
    };

    export default Home;
    ```

## Advantages

### Expo Router

- **Simplicity:** File-based routing makes navigation structure clear and easy to manage.
- **Productivity:** Quickly set up and navigate between screens without complex configuration.
- **Integration:** Seamlessly integrates with Expo's existing ecosystem and tools.

## Common Commands

### Expo Router Commands

- **Run the project:**

    ```bash
    npx expo start
    ```

- **Build the project:**

    ```bash
    npx expo build
    ```

## Editor Configuration

To ensure code quality and consistency, follow these practices:

- **ESLint and Prettier:** Use Prettier ESLint for linting and formatting.

    ```bash
    npx eslint --fix 'app/**/*.tsx'
    ```

- **Naming Conventions:** Use consistent naming conventions for files and folders.
  - Use `PascalCase` for component and screen files (e.g., `RoomPage.tsx`, `LoginScreen.tsx`).
  - Use `camelCase` for hooks and utility functions (e.g., `useFetchData.ts`, `formatDate.ts`).

- **Styling:** Use `createStyleSheet` for styling instead of Tailwind CSS. Create a central file for theme colors and other styling elements.

    ```tsx
    // styles/colors.ts
    export const colors = {
      primary: '#3498db',
      secondary: '#2ecc71',
      // Add other colors here
    };

    // styles/themes.ts
    import { StyleSheet } from 'react-native';
    import { colors } from './colors';

    export const commonStyles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.primary,
      },
      // Add other styles here
    });
    ```

Sure, here's the continuation and completion of the README:

## Resources

### Expo Router

- [Expo Router Documentation](https://expo.github.io/router/docs/)

### General Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Best Practices

To ensure the maintainability and scalability of your project, follow these best practices:

### Component Structure

- **Separate Concerns:** Split different components of a page into separate files. For example, in a room page, separate the chat functionality from the room page code.
- **Avoid Coupling:** Avoid tightly coupling components together. Abstract functionality to promote reusability.

### Testing

- **Component Tests:** Ensure all components have passing tests.
- **Automated Testing:** Use libraries like Jest and React Testing Library for automated testing.

### Code Quality

- **Linting:** Run linting before committing any code changes to ensure code quality.

    ```bash
    npx eslint --fix 'app/**/*.tsx'
    ```

- **Formatting:** Use Prettier for consistent code formatting.

### Styling

- **Centralized Styling:** Use a centralized file for colors and other styling elements. This promotes consistency and easy maintenance.

    ```tsx
    // styles/colors.ts
    export const colors = {
      primary: '#3498db',
      secondary: '#2ecc71',
      // Add other colors here
    };

    // styles/themes.ts
    import { StyleSheet } from 'react-native';
    import { colors } from './colors';

    export const commonStyles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.primary,
      },
      // Add other styles here
    });
    ```

- **StyleSheet Creation:** Use `StyleSheet.create` for defining styles in React Native.

    ```tsx
    import { StyleSheet } from 'react-native';
    import { colors } from './styles/colors';

    const styles = StyleSheet.create({
      button: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: '#fff',
        textAlign: 'center',
      },
    });

    export default styles;
    ```

### Hooks

- **Reusable Hooks:** Store reusable hooks in the `app/hooks` directory.

    ```tsx
    // hooks/useFetchData.ts
    import { useState, useEffect } from 'react';

    const useFetchData = (url: string) => {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchData = async () => {
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
          setLoading(false);
        };

        fetchData();
      }, [url]);

      return { data, loading };
    };

    export default useFetchData;
    ```

## Conclusion

For any further assistance or questions, refer to the resources linked above or consult the official documentation of the respective libraries and frameworks.

Happy coding!