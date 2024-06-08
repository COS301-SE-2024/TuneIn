

# TuneIn with NativeWind and Expo Router

This README provides detailed instructions for setting up and using NativeWind (a Tailwind CSS solution for React Native) and Expo Router in your React Native project. It also includes examples of why these libraries are used, their advantages, common commands, and links to their respective resources.

## Table of Contents
- [Folder Structure](#folder-structure)
- [Installation](#installation)
  - [NativeWind](#nativewind)
  - [Expo Router](#expo-router)

- [Usage Examples](#usage-examples)
  - [NativeWind Usage](#nativewind-usage)
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
│   │   ├── AllFriends.tsx
│   │   ├── CreateRoom.tsx
│   │   ├── EditProfile.tsx
│   │   ├── EditRoom.tsx
│   │   ├── Home.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RoomPage.tsx
│   │   ├── Search.tsx
│   │   └── ... (other pages/screens)
│   │
│   └── index.tsx
│   
│
├── my-app.d.ts
├── babel.config.js
├── tailwind.config.js
└── package.json
```

- **app/components/**: Contains all reusable components.
- **app/models/**: Contains TypeScript class definitions to streamline data handling.
- **app/screens/**: Contains all the screens (pages) of the app.
- **app/_layout.tsx**: The layout file for the app's routing structure.
- **app/index.tsx**: The entry point for the app.

## Installation

### NativeWind

NativeWind brings the power of Tailwind CSS to React Native. Follow these steps to install it:

1. **Install NativeWind and dependencies:**

    ```bash
    npm install nativewind
    npm install tailwindcss --save-dev
    ```

2. **Create Tailwind configuration file:**

    ```bash
    npx tailwindcss init
    ```

3. **Configure Tailwind for NativeWind:**

    Update `tailwind.config.js`:

    ```js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      purge: [
        './App.{js,jsx,ts,tsx}',
        './screens/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}'
      ],
      content: [
        "./App.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```

4. **Configure Babel for NativeWind:**

    Create or update `babel.config.js`:

    ```js
    module.exports = function(api) {
      api.cache(true);
      return {
        presets: ['babel-preset-expo'],
        plugins: ['nativewind/babel'],
      };
    };
    ```

### Expo Router

Expo Router provides a file-based routing solution for Expo projects.

1. **Install Expo Router:**

    ```bash
    npx expo install expo-router
    ```

2. **Set up routing configuration:**

    Create a folder structure under your project root with the following files:

    ```
    - app
      - _layout.tsx
      - index.tsx
    ```

    **`_layout.tsx`:**

    ```tsx
    import { Stack } from 'expo-router';

    const Layout = () => {
      return <Stack />;
    };

    export default Layout;
    ```

    **`index.tsx`:**

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

3. **Update `app.json`:**

    Make sure to include the `expo-router` plugin:

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

### NativeWind Usage

**Example: Using Tailwind CSS classes in React Native components**

```tsx
import React from 'react';
import { View, Text } from 'react-native';

const ExampleComponent = () => {
  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <Text className="text-white text-lg">Hello, Tailwind CSS with NativeWind!</Text>
    </View>
  );
};

export default ExampleComponent;
```

### Expo Router Usage

#### Using `Link` Component

The `Link` component is a convenient way to navigate between screens declaratively.

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

2. **Link to the new screen using `Link` component:**

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

#### Using `router.navigate`

For more programmatic navigation, use the `router.navigate` method.

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

2. **Navigate to the new screen using `router.navigate`:**

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

### NativeWind

- **Efficiency:** Tailwind CSS simplifies styling with utility-first classes, reducing the need for custom CSS.
- **Consistency:** Enforces consistent styling across the project.
- **Productivity:** Rapidly prototype and iterate on designs.

### Expo Router

- **Simplicity:** File-based routing makes navigation structure clear and easy to manage.
- **Productivity:** Quickly set up and navigate between screens without complex configuration.
- **Integration:** Seamlessly integrates with Expo's existing ecosystem and tools.

## Common Commands

### Tailwind Purge

Tailwind CSS can purge unused styles to optimize the bundle size. This is configured in `tailwind.config.js`.

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

To prevent the editor from showing redline errors when using `className`, create a `my-app.d.ts` file with the following content:

```typescript
/// <reference types="nativewind/types" />
```

## Resources

### NativeWind

- [NativeWind GitHub](https://github.com/marklawlor/nativewind)
- [NativeWind with Expo](https://www.nativewind.dev/quick-starts/expo)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Expo Router

- [Expo Router Documentation](https://expo.github.io/router/docs/)
